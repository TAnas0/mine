---
title: "Git over SSH vs HTTPS"
subtitle: "Two ways to connect to Git remotes, and when SSH is worth setting up"
category: "Developer Tooling & Security"
status: "Published"
date: "2025-04-30"
draft: false
tags: ["git", "security", "devops"]
excerpt: "Learn when SSH is useful for Git, how to set up Ed25519 keys, and how to manage multiple GitHub identities on one machine."
---

When you clone a repository or push code, Git usually gives you two connection protocols: HTTPS and SSH. Most developers start with HTTPS because it works out of the box, uses standard web ports, and requires no initial key setup. For many workflows, that convenience is all you ever need.

As your setup grows, though, you might run into situations where HTTPS feels awkward—like juggling personal and work GitHub accounts on the same laptop, provisioning credentials for a headless server, or dealing with expiring access tokens. In those situations, SSH can make your workflow significantly cleaner.

This guide covers when SSH is worth using, how to generate and configure modern Ed25519 keys on Linux, and how to use an SSH config file to manage multiple identities without friction.

## Situations Where SSH Helps

Neither protocol is universally better, but SSH solves several concrete operational problems particularly well:

### 1. Managing Multiple Git Accounts
If you contribute to open source with a personal account and push to private repositories with a work account, HTTPS credential management can get messy. Operating system keychains and credential helpers often default to storing one set of credentials per host (such as `github.com`), requiring manual overrides or environment variables to switch between accounts.

With SSH, you can assign different private keys to custom host aliases in your `~/.ssh/config` file. Git selects the correct identity based on the remote URL of the repository, so you never have to re-authenticate or risk pushing code under the wrong account.

### 2. Headless Automation and CI/CD Pipelines
Automated deployment scripts, container builds, and CI/CD runners often need repository access without an interactive user around to complete a browser login.

With SSH, you can generate a **Deploy Key** scoped to a single repository with read-only or read-write permissions. This gives your build server exactly the access it needs without binding the pipeline to an individual developer's personal account or access token. If that server is decommissioned or compromised, you revoke that single deploy key without affecting anyone else's access.

### 3. Key-Based Authentication vs. Token Expiration
Most major Git hosting services deprecated password authentication for HTTPS operations in favor of [Personal Access Tokens (PATs)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) or OAuth credential helpers. Organizations often enforce expiration policies—such as 30, 60, or 90 days—on tokens. When a token expires, a `git push` fails until you generate a new token and update your local credential cache.

SSH keys don't expire automatically unless your organization uses short-lived SSH certificates. Once you configure a key pair and add it to your SSH agent, it continues working until you choose to revoke or replace it. You still need good key hygiene—such as setting a strong passphrase and removing old keys from your account when you retire a machine—but you avoid unexpected interruptions in the middle of a release.

### 4. Stability on Large Operations
While both protocols run over TCP, large Git operations—such as cloning a repository with years of history or pushing large binaries via [Git LFS](https://git-lfs.com/)—can run into trouble over HTTPS. Proxies, corporate firewalls, and server-side request limits can terminate long-running HTTP connections, resulting in vague `RPC failed` or `connection reset by peer` errors.

SSH maintains a direct, stateful channel. When paired with SSH keep-alive settings (`ServerAliveInterval`), it tends to handle slow or interrupted long-running transfers with fewer dropped connections.

---

## Setting Up SSH on Linux

Setting up SSH takes only a few minutes. Here is the standard process on a Linux workstation.

### 1. Generate an Ed25519 Key Pair
Older guides often recommend RSA keys, but **Ed25519** is now the preferred public-key algorithm across modern systems. Ed25519 keys are compact (around 68 characters for the public key, compared to over 700 for RSA 4096), cryptographic handshakes are fast, and the algorithm is designed to avoid side-channel vulnerabilities related to execution timing.

Run this command in your terminal, replacing the comment with your email:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

When prompted:
1. Press **Enter** to accept the default file location (`~/.ssh/id_ed25519`).
2. Enter a strong passphrase to encrypt the private key on disk. Leaving the passphrase empty is tempting, but encrypting your key protects it if someone ever gains unauthorized access to your filesystem.

### 2. Start the SSH Agent and Add Your Key
To avoid typing your passphrase on every single Git operation, let `ssh-agent` hold your decrypted key in memory for the duration of your login session:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

Once added, the agent supplies the key automatically whenever Git connects to a remote.

### 3. Add Your Public Key to GitHub
Display the contents of your public key:

```bash
cat ~/.ssh/id_ed25519.pub
```

> Keep in mind: only share the public key (`.pub`). The private key (`~/.ssh/id_ed25519` without the extension) should never leave your machine.

Copy the output, then:
1. Open GitHub and go to **Settings → SSH and GPG keys**.
2. Click **New SSH key**.
3. Give it a descriptive title (like `work-thinkpad-arch`) so you know which physical machine it belongs to.
4. Paste your key into the **Key** field and click **Add SSH key**.

### 4. Verify the Connection
Test your authentication directly from the terminal:

```bash
ssh -T git@github.com
```

If everything is configured correctly, GitHub will verify your identity with a message like:

```text
Hi username! You've successfully authenticated, but GitHub does not provide shell access.
```

---

## Managing Multiple Accounts with `~/.ssh/config`

One of the most practical reasons to use SSH is managing multiple GitHub identities on one computer.

Imagine you have two separate keys:
- `~/.ssh/id_ed25519_personal` for personal projects
- `~/.ssh/id_ed25519_work` for your employer or client

You can define custom host aliases in `~/.ssh/config` to tell SSH which key to present:

```text
# Personal account (default)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Work account alias
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

The `IdentitiesOnly yes` directive is important: it tells SSH to offer only the identity file explicitly listed for that host, rather than trying every key loaded into your SSH agent. This avoids authentication failures caused by servers rejecting connections after too many failed attempts with unrelated keys.

When you clone a repository for work, replace `github.com` with your alias `github-work` in the remote URL:

```bash
git clone git@github-work:company-org/backend-service.git
```

For existing repositories already on your machine, update the remote URL using `git remote set-url`:

```bash
git remote set-url origin git@github-work:company-org/backend-service.git
```

Git will route all traffic for that repository through the work key automatically.

> **Tip**: Remember that Git commit metadata is separate from SSH authentication. SSH proves who you are to the server, but Git records whatever `user.name` and `user.email` are set in your repository config. To ensure your commits show your work email, set it inside that repository:
> ```bash
> git config user.email "your_work_email@company.com"
> ```

---

## When HTTPS Is the Better Choice

While SSH is convenient for day-to-day development across multiple accounts, HTTPS remains a solid and practical choice in many situations:

- **Quick public clones**: If you are cloning a public open-source repository on a temporary virtual machine, container, or colleague's computer just to inspect code or run a build, HTTPS requires no keys or credentials.
- **Strict corporate firewalls and proxies**: Some enterprise networks, hotel Wi-Fi setups, and guest networks block outbound traffic on port 22 (SSH). Because HTTPS traffic runs on port 443, it passes through nearly every network filter and corporate web proxy without special rules.
- **Native credential helper integration**: Tools like the GitHub CLI (`gh auth login`) and Git Credential Manager integrate directly with your system keychain and browser. If your organization relies on web-based single sign-on (SSO) with hardware security keys, HTTPS with a credential helper is often the easiest path to stay compliant.
- **Simpler onboarding**: For developers who primarily work on a single account and don't need automated deploy keys, HTTPS with a credential helper provides a straightforward setup without managing local key files.

---

## Summary

Neither Git over SSH nor Git over HTTPS is universally superior. Both protocols transfer the exact same data to and from your remote repository; they just handle identity and connection routing differently.

If HTTPS already works smoothly for you—especially with Git Credential Manager or the GitHub CLI managing your tokens—there is no need to switch. But if you find yourself juggling multiple accounts, setting up headless deployment runners, or dealing with token expiration friction, setting up an Ed25519 SSH key and a clean `~/.ssh/config` file is well worth the five minutes it takes.
