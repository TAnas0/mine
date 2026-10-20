---
title: "Git over SSH vs HTTPS"
subtitle: "Key hygiene, Ed25519 cryptography, and multi-identity config"
category: "Developer Tooling & Security"
status: "Published"
date: "2025-04-30"
draft: false
tags: ["git", "security", "devops"]
excerpt: "SSH offers a stable, secure, and frictionless Git experience for professional developers. Here is why it’s the superior choice, how to configure modern Ed25519 keys, and how to manage multiple identities cleanly."
---

There is no more ubiquitous developer tool than Git. As developers, we interact with Git constantly throughout the day: pushing branches, pulling upstream changes, cloning new tools, or running `git blame` to understand why a line was written.

By default, most developers start with HTTPS: it’s quick, convenient, and requires no initial cryptographic configuration. But once you move into professional engineering, continuous integration, and managing multiple client or work accounts, HTTPS quickly turns into friction.

SSH is almost always the superior choice. In this guide, we’ll break down why SSH should be your default protocol, how to generate modern Ed25519 keys, and how to cleanly manage multiple GitHub identities on a single machine.

## Why Choose SSH?

Here are the key technical advantages of SSH over HTTPS when working with Git:

### 1. Connection Stability on Long Operations
Ever had your connection drop during a massive `git clone` or a large LFS push? HTTPS transfers can be fragile on unstable networks, frequently resulting in opaque "connection reset by peer" or "RPC failed" errors. SSH runs over a persistent TCP session with built-in keep-alive and retransmission primitives, making it noticeably more resilient when handling large repositories.

### 2. Built for Headless Automation & CI/CD Pipelines
If you run automated deployment scripts, Docker build contexts, or CI/CD pipelines, SSH is designed for headless authentication. You can provision a read-only **Deploy Key** scoped strictly to a single repository, completely isolating credentials without binding them to an individual developer's personal account.

### 3. No Personal Access Token (PAT) Expiration Nightmares
Ever since GitHub deprecated password authentication over HTTPS, working over HTTPS requires generating Personal Access Tokens (PATs). Because security policies enforce 30, 60, or 90-day expiration windows on tokens, your terminal will eventually reject your `git push` right in the middle of a focused coding flow. SSH keys have no arbitrary expiration date: you configure them once, and they work silently until you explicitly rotate them.

### 4. Seamless Multi-Account Management
If you write open-source code on your personal profile while working on proprietary client repos on a corporate GitHub account, managing HTTPS credentials in your OS keychain is notoriously frustrating. With SSH, you can bind different cryptographic keys to different hosts directly in your local SSH configuration.

---

## Setting Up Modern SSH on Linux

### 1. Generate an Ed25519 Key Pair
Cryptographic standards evolve. While `RSA 4096` was the historical standard, **Ed25519** is now the recommended algorithm across modern systems engineering. Ed25519 keys have a tiny footprint (68 characters vs. over 700 for RSA), execute cryptographic handshakes significantly faster, and offer superior resistance to side-channel attacks.

Generate your key with an informative comment:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```
When prompted, save it to the default path (`~/.ssh/id_ed25519`) and protect it with a memorable passphrase.

### 2. Start the SSH Agent & Add Your Key
To ensure you only enter your passphrase once per session, load the key into the background agent:
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### 3. Add Your Public Key to GitHub
Display your public key (never share the private key without the `.pub` extension):
```bash
cat ~/.ssh/id_ed25519.pub
```
Copy the string output, navigate to **GitHub → Settings → SSH and GPG keys**, click **New SSH key**, paste the public key, and save.

### 4. Verify the Connection
Test the handshake directly:
```bash
ssh -T git@github.com
```
If configured properly, GitHub will return an authenticated greeting:
```text
Hi username! You've successfully authenticated, but GitHub does not provide shell access.
```

---

## Pro-Tip: Managing Multiple GitHub Accounts with `~/.ssh/config`

The single biggest operational superpower of SSH is using `~/.ssh/config` to multiplex between personal and work identities without constantly re-authenticating.

Suppose you have:
- `id_ed25519_personal` for your personal GitHub
- `id_ed25519_work` for your company GitHub

Create or edit `~/.ssh/config`:
```bash
# Default / Personal Account
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Work / Client Account Alias
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

Now, whenever you clone a company repository, simply substitute `github.com` with `github-work` in the remote URL:
```bash
# Clones using your work SSH identity automatically:
git clone git@github-work:company-org/backend-service.git
```
Git will transparently offer the correct work key, completely eliminating credential cross-contamination.

---

## When Is HTTPS Still the Better Choice?

Despite the superiority of SSH for daily development, HTTPS still has pragmatic use cases:
- **Ephemeral Public Clones**: When cloning a public open-source repository on a temporary cloud VM or sandbox where you don't want to import your private SSH keys.
- **Restrictive Corporate Firewalls**: Some corporate networks or guest Wi-Fi firewalls strictly block outgoing traffic on port `22` (SSH). Because HTTPS runs over port `443` (standard web traffic), it penetrates virtually any network filter.
- **Onboarding Non-Technical Collaborators**: Contributors who aren't comfortable with asymmetric cryptography or terminal key agents can get started faster with browser-based token flows.

---

## Summary

While HTTPS is a convenient fallback for one-off clones on untrusted machines, SSH remains the gold standard for daily professional software engineering. Pairing modern Ed25519 keys with a clean `~/.ssh/config` gives you an authentication workflow that is faster, cryptographically superior, and completely immune to sudden token expiration interruptions.
