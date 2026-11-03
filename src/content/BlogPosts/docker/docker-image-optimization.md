---
title: "Docker Development and Production Hygiene"
subtitle: "Clean local machine and lean production containers"
category: "DevOps & Containers"
status: "Published"
target_audience: "DevOps Engineers, Backend Developers"
date: "2026-08-14"
draft: false
tags: ["docker", "devops", "containers"]
excerpt: "A practical guide to keeping Docker clean locally and lean in production, covering resource hygiene, image optimization, build caching, and image-layer auditing."
---

<!-- TODO(metadata): The article currently contains several unfinished placeholder notes (e.g. lines with '[I want to speak about...]') and commented-out sections. Consider setting 'draft: true' in frontmatter until all flagged sections are authored, or complete the tasks below before publishing. -->

Docker initially grew on me thanks to how much it made my system cleaner: for a tinkerer in all sorts of systems, languages and ecosystems, Docker provided a reliable isolated environment. For a curious Linux user whose system eventually turns into a mess of installed packages, that was enough for me to fall in love with Docker. However, Docker too requires some *"hygiene"* and best practices. As with any other tool, one must take care of it to get the most out of it. This will give you better control over your environment on your machine, as well as in production.

Docker has great value for developer experience in its early phases. Quick environments on demand, ideal for prototyping. That's often what happens in the early stages of a project, where we write a Dockerfile just for them to work, and that's it. To get a webserver loaded, a web app to serve on localhost, or get started quickly with an open source project. It's when moving to production that we start looking differently at our authored Dockerfiles (can the images be smaller and quicker to build?) and the underlying complexity of volumes, networks, etc.


We will be looking into:
1. Docker local environment: how to keep an eye on local Docker resources and manage them, use Docker compose to manage networks of containers
2. Docker optimisation: How to show your own Docker image some love in Dockerfile, image optimisation, auditing your docker image layers.
<!-- 3. Quick wins for Docker security: low-hanging fruits, but very effective. -->
<!-- TODO(structure): Decide on Section 3. Security (non-root users, secret mounts, minimal attack surface) is deeply tied to production container hygiene. Either uncomment and flesh out Section 3 ("3. Production Container Security & Hardening") at the bottom of this article and re-enable it in this outline, or integrate those quick wins directly into Section 2. -->


## 1. Docker Local Environment Hygiene

I suspect you have been using Docker for a while now, and tried out different builds and pulled many base images. You may even have running containers at the moment. Let's take a look at the resources Docker is using currently on your machine:

```bash
$ docker system df
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          64        11        33.7GB    28.92GB (85%)
Containers      11        9         1.463GB   1.238GB (84%)
Local Volumes   60        3         9.317GB   9.196GB (98%)
Build Cache     96        0         2.29GB    2.29GB
```

To check active resource utilization of your current workloads, use:

```bash
$ docker stats
CONTAINER ID   NAME                                 CPU %     MEM USAGE / LIMIT    MEM %     NET I/O           BLOCK I/O         PIDS
10487046ace3   exampleapplication-worker-1          0.12%     529.4MiB / 15.5GiB   3.34%     5.98MB / 6.94MB   45.2MB / 25.4MB   24
29920cc47107   exampleapplication-dag-processor-1   100.19%   364.7MiB / 15.5GiB   2.30%     41.6MB / 41.2MB   101MB / 2.39MB    5
2e3536009ef1   exampleapplication-triggerer-1       1.19%     254.1MiB / 15.5GiB   1.60%     23.8MB / 34MB     47MB / 41.1MB     8
```

For granular details on a specific container's configuration, networking, or mounted volumes: `docker inspect [target]`.

Over time, the system may accumulate bloat due to dangling Docker images, which are untagged images and are not referenced by any running container. This can accumulate quickly when building heavy images and customizing them over time. This is most notable when developing a new image, and changing frequently its Dockerfile. Many intermediary layers of images are left dangling without any future use.

Other notable culprits: abandoned build caches, unused volumes left by deleted containers.


Clean up:
- friendly version, can be performed periodically:
  - `docker image prune`: removes only untagged/dangling images
  - `docker image prune -a`: removes all unreferenced images (not currently used by any container)
  - `docker container prune`: removes all stopped containers
- nuke option: all stopped containers, unused networks, dangling and unused images, and unreferenced volumes: `docker system prune -a --volumes`
<!-- TODO(cleanup-commands): Note that BuildKit cache is stored separately in '/var/lib/docker/buildkit'. Running standard image prune leaves BuildKit cache untouched. Mention 'docker builder prune' and 'docker builder prune --filter until=24h' to clear stale layer caches without blowing away daily dependencies. -->


Now, for the vast majority of projects, a single Dockerfile is enough. I give you that. But most projects need a third-party piece: database, a message broker, reverse proxy, search engines, etc., which are better configured and run in tandem with the project (meaning better than installed in the system itself, or alongside the app in the docker container). This is where [**Docker Compose**](https://docs.docker.com/compose/) comes in—a lightweight orchestrator of Docker containers defined in a single declarative file `docker-compose.yml` (or `compose.yml`). It excels at grouping containers, managing their networks, volumes, and service dependencies, making it reliable for local development as well as lightweight production deployments.

And since we are speaking of Docker Compose and developer experience, we must speak about live reloading with [Compose Watch](https://docs.docker.com/compose/how-tos/file-watch/). Without it, one would have to rebuild their images with any changes to the app source code.

Each Compose Watch config contains a key `action` that can be set to:
- `sync`: instantly reflects local source code changes into the running container without restarting.
- `rebuild`: automatically triggers an image rebuild, useful when project dependencies change for example.

This is how it would look for a NodeJS application:
```yaml
services:
  web:
    image: node:18
    build: .
    ports:
      - "3000:3000"
    develop:
      watch:
        - action: sync # Reflect source code changes inside the container
          path: ./src
          target: /app/src
        - action: rebuild # Rebuild Docker image
          path: package.json
```


## 2. Docker image optimization and layer auditing

> Note before refactoring your Dockerfile:
> - **Safety First**: Make sure you have a reliable test suite for the application, including relevant integration or E2E tests for the containerized application.
> - **Baseline Measurement**: If interested in performance optimisation, record the current image size and cold/warm build times. Use `docker images` to inspect image size and `time docker build` to measure build duration.

<!-- TODO(profiling): Mention BuildKit's plain progress output ('DOCKER_BUILDKIT=1 docker build --progress=plain .') to view exact per-step elapsed time and cache hit/miss statuses. This turns subjective 'builds feel slow' into measurable bottleneck detection. -->

If you aim to optimize a Docker image, first, know your objectives and current Docker image state. Define your target objective before writing code. Different goals require different trade-offs:
- **Build Speed**: can affect delivery causing slow pipelines, or affect developer velocity. Layer caching strategies, caching package manager directories (`pip`, `npm`, `apt`).
- **Image Size**: for Network Transfer & Storage. compressed layer downloads across CI/CD runners and registries.
- **Security & Attack Surface**: Minimizing installed packages, eliminating build tools from runtime layers, avoiding root users.
- **Container Maintainability**: Readability, standardizing instructions, keeping layer logic clean.

The following recommendations cover all angles in various ways. They are considered best practices, so we strongly advise you to adhere to them across most of your projects, regardless of your specific current pain point.

### 2.1. Docker Context Discipline

The `.dockerignore` file specifies which files to ignore in the [Docker build context](https://docs.docker.com/build/concepts/context/), which is usually the root of your repository.

Much like `.gitignore` for Git source control, `.dockerignore` ensures your Docker build context does not include unnecessary bloat or leak sensitive secrets.

Please note that the two files are completely separate. Yes, their entries often overlap (`.env` files, installed dependencies, build artifacts), but they serve distinct purposes:
- **Git ignored, Docker included**: Proprietary software binaries, local caches needed during assembly, or specific build artifacts.
- **Docker ignored, Git included**: Documentation, CI/CD workflow scripts, test suites, and Git history itself.

As a best practice, your Docker image should build reliably from a clean repository clone. In automated CI/CD pipelines, runners start from a fresh checkout, preventing untracked local files from silently polluting your container layers.

Additionally, CI platforms create hidden directories on the worker to manage the pipeline, cache files, and store logs.
<!-- TODO(build-context-mechanics): Explain the underlying mechanics: when you run 'docker build .', the Docker CLI creates a tar archive of everything in the build context and transmits it across the Docker daemon socket (or over SSH/TCP for remote CI builders). If a 2GB directory of test videos, local database dumps, or raw assets isn't in .dockerignore, you waste 30+ seconds uploading context before line 1 of the Dockerfile even runs. Mention the classic CLI log message: "Transferring build context: 1.84GB" as the telltale warning sign of missing context discipline. -->

That's why we strongly recommend you use the Allowlist approach:
1. Ignore everything
2. Make exceptions for your files and folders
3. Explicitly re-ignore files that are never needed

```text
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
<!-- TODO(security-git-leak): Emphasize why ignoring '.git' is not just about image size (though git history can easily add 100MB+), but a critical security risk. If '.git' is copied into an image via 'COPY . .', anyone with access to the container image can run 'git log -p' or dump objects, recovering past deleted secrets, private commit messages, internal developer emails, and proprietary branch history. -->

.github/      # GitHub Actions workflows
.gitlab-ci/   # GitLab CI/CD
.circleci/    # CircleCI

node_modules/ # Local Node.js packages
.venv/        # Local Python virtual environments
vendor/       # Local language dependency folders (Go, PHP, etc.)
target/       # Compiled build artifacts (Rust, Java/Maven, etc.)
<!-- TODO(dockerignore-additions): Add other common development artifacts that frequently pollute images if unignored: Python '__pycache__/' and '*.pyc', coverage directories (coverage/, .nyc_output/), test files (*.test.ts, tests/), build temporary caches (.turbo/, .parcel-cache/), and local log files (*.log). -->

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
<!-- TODO(intro-base-image): Write an introductory paragraph framing base image choice as the single highest-leverage decision for both image footprint and security attack surface. Establish the golden rule: start with the absolute minimum runtime needed for production, never a bloated development image. -->

Implicit tag is latest when no tag is defined. Unpredictable builds.
<!-- TODO(pinning-strategy): Fix typo ('Unpredicatable' -> 'Unpredictable'). Emphasize the anti-pattern of ':latest' and mutable major tags (e.g. 'FROM node:20'). If an upstream base image updates overnight with a breaking security patch or dependency bump, CI builds can fail without any code changes. Introduce SHA-256 digest pinning ('FROM node:22-slim@sha256:...') for maximum immutability in regulated environments. -->
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
<!-- TODO(tag-structure): Formalize the tag anatomy explanation into a Markdown reference table comparing:
  - Full/Default (e.g. 'node:22', 'python:3.12') -> 1GB+, contains build-essential, curl, git, man pages. Great for local prototyping, terrible for production.
  - Slim (e.g. 'node:22-slim', 'python:3.12-slim') -> ~150MB-200MB, Debian stripped of docs and non-essential tooling, preserves glibc. Best production default for dynamic languages.
  - Alpine (e.g. 'node:22-alpine', 'python:3.12-alpine') -> ~40MB-50MB, uses musl libc and apk. Tiny, but trade-offs with native extensions.
  - Distroless (e.g. 'gcr.io/distroless/nodejs22-debian12') -> ~100MB, no package manager, no shell. Extreme security hardening.
  - Scratch ('FROM scratch') -> 0MB, for self-contained, statically linked binaries (Go, Rust). -->


Architecture tags: 
amd64      → 64-bit Intel/AMD processors (most PCs & servers)
arm64      → 64-bit ARM processors (Apple Silicon, Raspberry Pi 4/5)
arm/v7     → 32-bit ARM (older Raspberry Pi)
<!-- TODO(multi-arch): Explain architecture tags (amd64 vs arm64) in the context of modern development: with developers working on Apple Silicon (arm64/aarch64) and cloud servers running x86_64 (amd64) or AWS Graviton (arm64). Introduce 'docker buildx build --platform linux/amd64,linux/arm64' to prevent architecture mismatch crashes (e.g., the infamous 'exec format error'). -->

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
<!-- TODO(scratch-and-distroless): Expand on 'FROM scratch' and Google Container Tools' Distroless ('gcr.io/distroless/static'). Provide a concrete example: for a Go service compiled with 'CGO_ENABLED=0', running 'FROM scratch' produces an image with zero CVEs and under 20MB. Note the operational trade-off of having no shell (no 'docker exec -it ... /bin/sh' for live debugging, requiring ephemeral debug containers or robust distributed logging/telemetry). -->

<!-- https://www.geeksforgeeks.org/devops/docker-scratch-based-images/ -->
<!-- https://docs.docker.com/build/building/base-images/#create-a-minimal-base-image-using-scratch -->


-slim: Strips out man pages, documentation, and non-essential utilities while retaining standard glibc and apt. This is typically the safest production default for interpreted and dynamic languages.

-alpine: Swaps the C implementation from GNU C Library `glibc` for its alternative designed to be lighter `musl libc` (https://musl.libc.org/). can introduce compatibility issues with native dependencies and precompiled binaries. While it yields microscopic image sizes, it can introduce subtle bugs with multi-threading, DNS resolution, or pre-compiled C-extensions. It might be overkill for most, and I have succombed to the temptation and paid the price before. It shines where image size is of crucial importance such as IoT and embedded devices.
<!-- TODO(alpine-vs-slim): Fix typo ("succombed" -> "succumbed"). Detail the real-world pitfalls of Alpine with Python and Node:
  1. Python wheels: PyPI pre-compiled binary wheels (PEP 513/599 manylinux) are built for glibc. On Alpine (musl), pip cannot install wheels and must fall back to building from C/C++ source code, requiring gcc, make, musl-dev, and libffi-dev. This paradoxically results in 10x slower build times and often a LARGER final layer than Debian-slim!
  2. DNS resolution quirks: Alpine's musl libc handles parallel DNS queries differently than glibc (e.g. ignoring 'options single-request' or search domain timeouts in Kubernetes).
  Recommendation: Use Debian-slim for Python/Node, and consider Alpine primarily for Go/Rust or simple utilities. -->

DockerHub's Verified Publisher: https://docs.docker.com/docker-hub/image-library/trusted-content/#verified-publisher-images
<!-- TODO(trusted-content): Convert raw URL into proper prose explaining Docker Official Images (DOI) and Verified Publishers as a supply-chain security baseline to protect against typosquatting, cryptominers, and unmaintained third-party images. -->


### 2.3. Layer Ordering

[Properly introduce the concept of layering in docker images]
<!-- TODO(layering-intro): Explain how Docker layers actually work under the hood: each instruction in a Dockerfile (RUN, COPY, ADD) creates an immutable, read-only layer managed by the storage driver (overlay2). Docker caches each layer based on a hash of the instruction string, parent layer hash, and file checksums (for COPY/ADD). The cardinal rule of layer caching: if layer N changes, Docker invalidates the cache for layer N and ALL subsequent layers (N+1, N+2, ...). -->

-  Ordering instructions from least-frequently-changed (base OS, dependencies) to most-frequently-changed (source code) for optimal layer caching.

Caveat:
`RUN apt-get update` and install in the same line
`COPY vs ADD`
Reducing the number of layers and layer count testing
<!-- TODO(layer-rules): Replace this raw bullet list with detailed sub-sections and bad-vs-good code comparisons for the four classic layer optimization rules:
  1. Separate manifests from source code: Always run 'COPY package*.json ./' followed by 'RUN npm ci', and ONLY THEN 'COPY . .'. Explain that code changes frequently (invalidating everything after), while dependencies change rarely.
  2. Chain apt-get commands in a single RUN:
     BAD:
       RUN apt-get update
       RUN apt-get install -y curl
       RUN rm -rf /var/lib/apt/lists/*
     Explain why this is an anti-pattern: Docker saves the intermediate layer with the full package index (/var/lib/apt/lists/), and the third layer only marks files as deleted without reducing the image footprint!
     GOOD:
       RUN apt-get update && apt-get install -y --no-install-recommends \
           curl \
        && rm -rf /var/lib/apt/lists/*
  3. COPY vs ADD: Use COPY for standard file/folder copying. Only use ADD when automatically unpacking local tar archives ('ADD archive.tar.gz /opt/'). Avoid ADD for remote URLs; use 'RUN curl ... && tar ... && rm' instead to avoid bloating layers with temporary downloads.
  4. BuildKit Cache Mounts: Introduce modern BuildKit cache syntax ('RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt'). This speeds up local rebuilds by persisting the package cache outside the image layers without increasing the final image size. -->

### 2.4. Multi-stage builds:

https://docs.docker.com/build/building/multi-stage/
<!-- TODO(multistage-depth): Convert this raw notes outline into clear explanatory prose:
  1. Explain why multi-stage builds are the single most effective tool for image reduction: they strictly isolate the *build-time environment* (GCC, Rustc, TypeScript compilers, test runners, git, header packages) from the *runtime environment* (only the compiled binary or production bundle).
  2. Explain the Node.js example step-by-step: highlight why 'npm ci' installs devDependencies (needed for building/compiling), and why 'npm prune --omit=dev' runs before copying artifacts to the runner stage.
  3. Address how intermediate stages work: BuildKit executes stages concurrently when independent and completely discards unused intermediate layers from the final produced image. -->

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
<!-- TODO(compiled-multistage-example): Add a second multi-stage example for a compiled language (Go or Rust) to demonstrate extreme optimization. For instance, contrast an 850MB 'golang:1.24' build stage with a runtime stage using 'FROM scratch' or 'gcr.io/distroless/static:nonroot' producing a 12MB production container. This provides balance for readers building backend systems in static languages. -->
<!-- TODO(target-flag): Mention targeted builds: 'docker build --target builder -t myapp:dev .'. Explain how this allows teams to use a single Dockerfile for both production builds and local dev/test pipelines without maintaining divergent Dockerfile.dev and Dockerfile.prod files. -->

### 2.5 Auditing Images and Layer inspection

- Using native CLI commands: `docker history <image-name>` to inspect layer footprint.
- Tooling for visual layer inspection: `dive <image-name>`.
<!-- TODO(auditing-walkthrough): Expand Section 2.5 with practical inspection workflows:
  1. Native inspection: Show a concrete example of 'docker history --format "table {{.Size}}\t{{.CreatedBy}}" <image>' and explain how to spot "accidental megabytes" (e.g. 200MB hidden in a stray build artifact or uncleaned cache).
  2. The 'dive' CLI tool: Explain how to interpret Dive's split-terminal TUI (layer list on the left, file tree on the right, and the 'Wasted Space' detector). Mention running Dive in automated CI checks via 'CI=true dive <image> --ci-config .dive-ci' with a failure threshold for efficiency score.
  3. Layer-level vulnerability scanning: Show how auditing image layers directly relates to CVE security. Mention 'docker scout quickview <image>' or 'trivy image --severity HIGH,CRITICAL <image>' to identify which specific base layer or package introduced a security advisory. -->

<!-- 
## 3. Quick Wins for Docker Security
<!-- TODO(security-overhaul): Uncomment and polish Section 3 ("3. Production Container Security & Hardening")! Security and size optimization go hand-in-hand (fewer packages = fewer CVEs).
  Key items to complete and polish:
  1. Non-root user: Polish the explanation of UID/GID >= 10000. Crucial Dockerfile nuance: highlight that 'RUN chown -R appuser:appuser /app' copies all files into a NEW layer, potentially doubling the image size! Teach the zero-cost alternative: 'COPY --chown=appuser:appuser . .'.
  2. Secret management: Explain why 'ARG' and 'ENV' must NEVER be used for sensitive API keys, NPM tokens, or DB passwords (they get baked permanently into image metadata and can be viewed via 'docker history'). Provide a BuildKit secret mount snippet: 'RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci'.
  3. Read-only filesystem: Mention hardening containers at runtime using '--read-only' with tmpfs mounts ('--tmpfs /tmp --tmpfs /run') to prevent malware from persisting binaries inside a compromised container.
  4. Healthchecks: Complete the explanation of the Python healthcheck snippet. Note that 'HEALTHCHECK' instructions allow Docker and Docker Compose orchestrators to monitor container health and enforce service dependencies ('depends_on: { service: { condition: service_healthy } }') rather than just checking if the process PID is alive. -->

- **Non-root Execution**: Never run application processes as `root`. Create a dedicated system user (`USER node` or `USER appuser`) to enforce the principle of least privilege.
- **Secret Management**: Never bake credentials or API keys into image layers. Pass secrets at runtime via environment variables or secret store mounts.
- **Container Healthchecks**: Define an explicit `HEALTHCHECK` instruction that reports container health to Docker.


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
 -->
## References & Further Reading
- Official Dockerfile Best Practices: [docs.docker.com/develop/develop-images/dockerfile_best-practices/](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

- Instructions for [Containerization & Docker Best Practices](https://github.com/github/awesome-copilot/blob/main/instructions/containerization-docker-best-practices.instructions.md) from Github's [Copilot Awesome list](https://github.com/github/awesome-copilot/tree/main).
<!-- TODO(references): Add links to authoritative tools and documentation:
  - Wagoodman Dive Repository: https://github.com/wagoodman/dive
  - Docker BuildKit Cache Documentation: https://docs.docker.com/build/cache/
  - Google Container Tools Distroless: https://github.com/GoogleContainerTools/distroless
  - Docker Compose File Watch: https://docs.docker.com/compose/how-tos/file-watch/
  - Open Container Initiative (OCI) Image Specification: https://github.com/opencontainers/image-spec -->
