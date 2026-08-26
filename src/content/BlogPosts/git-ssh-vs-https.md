---
title: "Git over SSH vs HTTPS"
date: "2025-04-30"
tags: ["Git", "SSH", "DX", "Devops", "Automation"]
excerpt: "SSH offers a more stable, secure, and frictionless Git experience for professional developers. In this post, I break down why it’s the superior choice and walk through a quick, modern setup."
---


There is no more ubiquitous developer tool than Git. What do you think of a developer that has never heard of it? Or worse, one that doesn't "like it"?

As developers, we interact with Git almost every day, whether it’s pushing code to GitHub, cloning the newest shiniest OS tool, or finding a coworker to git blame. By default, most of us stick to HTTPS for these operations_ it’s quick, it’s convenient, and it usually just works.

But sometimes, there is a better way: SSH.

In fact, it’s almost always the superior choice. In this post, we’ll break down why SSH should be your go-to and how to set it up in just a few steps.

## Why Choose SSH?

Here are some of the key advantages of SSH over HTTPS when working with Git:

1. More Reliable Connection: Ever had your connection drop during a long Git operation over the network? It’s frustrating, especially with large repositories. SSH is generally more resilient to network issues than HTTPS. Whether you’re working with huge repos or just have a shaky internet connection, SSH’s connection stability and retry mechanisms make it less prone to the kinds of errors that commonly happen with HTTPS, like the dreaded "connection reset" or "unexpected disconnect."

2. Better for Automation and CI/CD: If you’re running automated scripts, continuous integration (CI), or using a Continuous Delivery (CD) pipeline, SSH is the way to go. When working with automation, you want to avoid having to store or repeatedly use tokens (which can expire or get exposed). SSH keys are a far better option for automated Git operations — they're secure and don’t require re-authentication after the setup. Whether you’re deploying code or running tests, SSH simplifies your life.



### Setting Up SSH on Linux

Setting up SSH on Linux is quick and easy! Here’s a step-by-step guide to get you going:

1. Generate Your SSH Key

Cryptographic standards change. While RSA 4096 was the old go-to, it is now considered legacy. Ed25519 is the modern standard for systems engineering. It has a much smaller key footprint, handles handshakes faster, and offers stronger mathematical security against modern attack vectors.

Run the following command to generate your SSH key:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

This will create a highly secure Ed25519 key pair optimized for modern systems performance.

2. Add Your SSH Key to the SSH Agent
Start the SSH agent:

```bash
eval "$(ssh-agent -s)"
```

Then add your SSH private key to the agent:

```bash
ssh-add ~/.ssh/id_ed25519
```

3. Add Your SSH Key to GitHub

Now, let’s copy your SSH public key to GitHub. First, view your public key:

```bash
cat ~/.ssh/id_ed25519.pub
```

Copy the output (your public key), then go to GitHub → Settings → SSH and GPG keys and click New SSH key. Paste your key there and save it.

4. Test the SSH Connection

Finally, test your SSH connection to GitHub:

```bash
ssh -T git@github.com
```

If everything’s set up correctly, you should see a greeting from Github in your terminal.


### Caveats: When HTTPS is the better option

There are specific scenarios where HTTPS can still be the more practical option:

- Quickly Clone a Public Repository: If you're just interested in cloning a public repository (like a quick read or a one-off), HTTPS can be more convenient. You don’t need to set up SSH keys or worry about authentication.
- Restricted Environments (Firewall/Proxy Issues): If you're working behind a corporate firewall or in a network with strict proxy rules, SSH (port 22) may be blocked. In such environments, HTTPS is usually the preferred option because it runs over the more commonly allowed port 443, which is open for secure web traffic.
- When Collaborating with Non-Technical Users: Sometimes, collaborators who aren't familiar with SSH or key management may find HTTPS simpler.
