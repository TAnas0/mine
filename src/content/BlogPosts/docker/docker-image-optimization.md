---
title: "Docker Development and Production Hygiene"
subtitle: "Clean local machine and lean production containers"
category: "DevOps & Containers"
status: "Published"
target_audience: "DevOps Engineers, Backend Developers"
date: "2026-08-14"
draft: false
tags: ["docker", "devops", "containers"]
excerpt: "A practical guide to keeping Docker clean locally and lean in production: resource hygiene, image optimization, and security quick wins."
---

> Note before refactoring your Dockerfile:
> - **Safety First**: Before touching any `Dockerfile`, ensure you have passing unit and end-to-end (E2E) integration tests for the containerized application.
> - **Baseline Measurement**: Always record your starting image size and cold/warm build times (`docker images`, `time docker build`).

Docker grew on me the first time thanks to how much it made my system cleaner: for a tinkerer in all sorts of systems, languages and ecosystems, Docker provided a reliable isolated environment. For a curious Linux user whose system eventually turns into mess of installed packages, that was enough for me to fall in love with Docker. However, Docker too requires some *"hygiene"* and best practices to not overwhelm you on your machine, as well as in production. [Docker's easy usability can lead to dangling containers, unused images hugging disk space, etc.]

Docker has great value for developer experience. Quick environments on-demand.
That's what we all do in the early stages of a project, where we write a Dockerfile just for them to work, and that's it. When moving to production, we then start looking differently at the docker images: can they be smaller, build time quicker, safer?

We will be looking into:
1. Docker local environment: how to keep an eye on local Docker resources and manage them, use Docker compose to manage networks of containers
2. Docker optimisation: How to show your own Docker image some love in Dockerfile, image optimisation, auditing your docker image layers.
3. Quick wins for Docker security: low-hanging fruits, but very effective.


## 1. Docker Local Environment Hygiene

I suspect you have been using Docker for a while now, and tried out different builds and pulled many base images. You may even have running container at the moment. Let's take a look at the resources Docker is using currently in your machine:

`docker system df`

To check active resource utilization of your current workloads, use: `docker stats`. For granular details on a specific container's configuration, networking, or mounted volumes: `docker inspect [target]`.

Over time, the system may accumulate bloat due to dangling Docker images, which are untagged images and are not referenced by any running container. This can accumulate quickly when building heavy images and customizing them over time [I want to speak about building something substantial, and changing frequently].
Other notable culprits: abandoned build caches, unused volumes left by deleted containers.


Clean up:
- friendly version, can be performed periodically: `docker image prune`, `docker container prune`
- nuke option: all stopped containers, unused networks, dangling and unused images, and unreferenced volumes: `docker system prune -a --volumes`


Now, for the vast majority of projects, a single Dockerfile is enough. I give you that. But most projects need a 3rd party piece: database, a message broker, reverse proxy, [suggest more]. Which are better configured and ran "in tandem" with the project (meaning better than installed in the system itself, or alongside the app in the docker container.) This is where [**Docker Compose**](https://docs.docker.com/compose/) comes in.
which can be described as a lightweight orchestrator of Docker containersin single on a declarative file `docker-compose.yml` (or `compose.yml`). Great at grouping containers, managing their networks, volumes, etc. Reliable as a production development too.

Adopt Docker Compose Watch: snippet of configuration for reloading, 


```yaml
services:
  web:
    image: node:18-alpine
    build: .
    ports:
      - "3000:3000"
    develop:
      watch:
        - action: sync
          path: ./src
          target: /app/src
        - action: rebuild
          path: package.json
```


## 2. Docker image optimization and layer auditing

If you aim to optimize a Docker image, first, know your objectives and current Docker image state. Define your target objective before writing code. Different goals require different trade-offs:
- **Build Speed**: can affect delivery causing slow pipelines, or affect developer velocity. Layer caching strategies, caching package manager directories (`pip`, `npm`, `apt`).
- **Image Size**: for Network Transfer & Storage. compressed layer downloads across CI/CD runners and registries.
- **Security & Attack Surface**: Minimizing installed packages, eliminating build tools from runtime layers, avoiding root users.
- **Container Maintainability**: Readability, standardizing instructions, keeping layer logic clean.


The following recommendations cover all angles in various ways. They are considered best practices, so we strongly advise you to adhere to them, to most of your projects, regardless of your specific current pain point.


### 2.1. Docker Context Discipline

The `.dockerignore` file specifies which files to ignore in the [Docker build context](https://docs.docker.com/build/concepts/context/), which is usually the root of your repository.

Much like `.gitignore` for Git source control, `.dockerignore` ensures your Docker build context does not include unnecessary bloat or leak sensitive secrets.

Please note that the two files are completely separate. Yes, their entries often overlap (`.env` files, installed dependencies, build artifacts), but they serve distinct purposes:
- **Git ignored, Docker included**: Proprietary software binaries, local caches needed during assembly, or specific build artifacts.
- **Docker ignored, Git included**: Documentation, CI/CD workflow scripts, test suites, and Git history itself.

As a best practice, your Docker image should build reliably from a clean repository clone. In automated CI/CD pipelines, runners start from a fresh checkout, preventing untracked local files from silently polluting your container layers.

Additionally, CI platforms create hidden directories on the worker to manage the pipeline, cache files, and store logs.

That's why we strongly recommend you use the Allowlist approach:
1. Ignore everything
2. Make exceptions for your files and folders
3. Explicitly re-ignore files that are never needed

```gitignore
# 1. Ignore absolutely everything in the directory by default
*

# 2. Allow specific folders/files required to build your app
!src/
!package.json
!package-lock.json
!requirements.txt
!main.go
!go.mod
!go.sum

# 3. Explicitly ensure sensitive metadata, local dependencies, and CI files remain ignored
.git          # Version control history

.github/      # GitHub Actions workflows
.gitlab-ci/   # GitLab CI/CD
.circleci/    # CircleCI

node_modules/ # Local Node.js packages
.venv/        # Local Python virtual environments
vendor/       # Local language dependency folders (Go, PHP, etc.)
target/       # Compiled build artifacts (Rust, Java/Maven, etc.)

# Environment Variables & Secrets (Crucial Security Guardrail)
.env          # Local environment files
.env.*        # Environment variations (.env.local, .env.production, etc.)
*.pem         # Certificates and private keys
*.key         # SSL keys

# IDEs and Editor Artifacts
.vscode/      # Visual Studio Code settings
.idea/        # JetBrains IDE configurations
*.swp         # Vim swap files

# Add more project-specific files, logs and temporary files, test directories, etc.

```

### 2.2. Base Image Selection

[Must select the right starting point. Must use a proper tag. In this order for writing]

Default tag is latest. Unpredicatable builds.
When building, you will have choice among many variants.
[Docker versioning: version-flavor/distro] python:3.12-slim or postgres:15-alpine

Clarify runtime and OS:
```bash
# Fully pinned (Safest for production)
docker pull postgres:18.1-alpine3.22

# Partially pinned (Runtime floats minor updates)
docker pull postgres:18-alpine3.22

# Floating OS (Vulnerable to silent base layer updates)
docker pull postgres:18.1-alpine
```


Architecture tags: 
amd64      → 64-bit Intel/AMD processors (most PCs & servers)
arm64      → 64-bit ARM processors (Apple Silicon, Raspberry Pi 4/5)
arm/v7     → 32-bit ARM (older Raspberry Pi)

Variants/flavours:
- slim
- full
- lts
- rc

Example:
- NodeJS: list tags they have
- Python: 
- Ubuntu: full fledged, helpful when needing heavy system dependencies [? what other cases?]
Other flavours you might come across: slim, alpine, etc.
- Or you can literally start `FROM scratch`. If you are the daring adventurous type. [you will have no shell]. If you want to run a binary inside, it must be statically compiled and self-contained.

<!-- https://www.geeksforgeeks.org/devops/docker-scratch-based-images/ -->
<!-- https://docs.docker.com/build/building/base-images/#create-a-minimal-base-image-using-scratch -->


-slim: Strips out man pages, documentation, and non-essential utilities while retaining standard glibc and apt. This is typically the safest production default for interpreted and dynamic languages.

-alpine: Swaps glibc for musl libc. While it yields microscopic image sizes, it can introduce subtle bugs with multi-threading, DNS resolution, or pre-compiled C-extensions. It might be overkill for most, and I have succombed to the temptation and ppaid the price before. It shine for IoT, embedded devices, [or suggest more situations].

DockerHub's Verified Publisher: https://docs.docker.com/docker-hub/image-library/trusted-content/#verified-publisher-images


### 2.3. Layer Ordering

[Properly introduce the concept of layering in docker images]

-  Ordering instructions from least-frequently-changed (base OS, dependencies) to most-frequently-changed (source code) for optimal layer caching.

Caveat:
`RUN apt-get update` and install in the same line
`COPY vs ADD`
Reducing the number of layers and layer count testing

### 2.4. Multi-stage builds:

https://docs.docker.com/build/building/multi-stage/

- Multi-stage build pattern: Separating the build environment (compilers, headers) from the slim runtime environment. Things that a Docker production image can do without: compilers, header files, test runners, package  managers

Dual-stage:
- builder stage:
- runtime stage:

For a Node.js application, it can look like this:

```dockerfile
# Stage 1: Build environment
FROM node:24-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --omit=dev

# Stage 2: Lean runtime environment
FROM node:24-slim AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
CMD ["node", "dist/index.js"]
```

### 2.5 Auditing Images and Layer inspection

- Using native CLI commands: `docker history <image-name>` to inspect layer footprint.
- Tooling for visual layer inspection: `dive <image-name>`.


## 3. Quick Wins for Docker Security

- **Non-root Execution**: Never run application processes as `root`. Create a dedicated system user (`USER node` or `USER appuser`) to enforce the principle of least privilege.
- **Secret Management**: Never bake credentials or API keys into image layers. Pass secrets at runtime via environment variables or secret store mounts.
- **Container Healthchecks**: Define an explicit `HEALTHCHECK` instruction so orchestrators like Kubernetes or Docker Swarm can accurately determine if your application container is ready to handle traffic.


```dockerfile
FROM python:3.11-slim AS builder
WORKDIR /app


# Non-root application user
RUN useradd --create-home appuser && chown -R appuser:appuser /app
USER appuser

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

EXPOSE 8000
CMD ["python", "main.py"]

```

In production-grade images (like those from Docker's official lab) approach this with stricter constraints. They explicitly set UID/GUID definitions to prevent permission drifts across volumes... unprivileged IDs (typically >= 10000)
If an attacker manages to escape from a Docker container to the host server, they get to keep their UID/GUID pair, and it might collide with an existing user/admin.
Additionally, a static UID/GUID allows for more predictable configuration, especially around rights and ownerships of mounted Docker volumes.

A dedicated liveness route (`/health` or `/healthz`) and strict timeouts.

## References & Further Reading
- Official Dockerfile Best Practices: [docs.docker.com/develop/develop-images/dockerfile_best-practices/](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

- Instructions for [Containerization & Docker Best Practices](https://github.com/github/awesome-copilot/blob/main/instructions/containerization-docker-best-practices.instructions.md) from Github's [Copilot Awesome list](https://github.com/github/awesome-copilot/tree/main).
