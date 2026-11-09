---
title: "Docker Development and Production Hygiene"
subtitle: "Clean local machine and lean production containers"
category: "DevOps & Containers"
status: "Published"
target_audience: "DevOps Engineers, Backend Developers"
date: "2026-08-14"
draft: false
tags: ["docker", "devops", "containers", "python"]
excerpt: "A practical guide to keeping Docker clean locally and lean in production, covering resource hygiene, image optimization, multi-stage builds, and container hardening."
---

Docker initially grew on me thanks to how much it made my system cleaner: for a tinkerer in all sorts of systems, languages and ecosystems, Docker provided a reliable isolated environment. For a curious Linux user whose system eventually turns into a mess of installed packages, that was enough for me to fall in love with Docker. However, Docker too requires some *"hygiene"* and best practices. As with any other tool, one must take care of it to get the most out of it. This will give you better control over your environment on your machine, as well as in production.

Docker has great value for developer experience in its early phases. Quick environments on demand, ideal for prototyping. That's often what happens in the early stages of a project, where we write a Dockerfile just for them to work, and that's it. To get a webserver loaded, a web app to serve on localhost, or get started quickly with an open source project. It's when moving to production that we start looking differently at our authored Dockerfiles (can the images be smaller and quicker to build?) and the underlying complexity of volumes, networks, and container security.

We will be looking into:
1. **Docker local environment**: how to keep an eye on local Docker resources, clean up reclaimable bloat, and use Docker Compose Watch for live Python development.
2. **Docker image optimization and layer auditing**: context discipline with `.dockerignore`, choosing the right Python base image (and why Alpine is often a trap in Python), layer ordering best practices, and production multi-stage builds.
3. **Production container security and hardening**: unprivileged non-root users, secret mounts with BuildKit, and native Python healthchecks.


## 1. Docker Local Environment Hygiene

### 1.1 Local resources utilization

I suspect you have been using Docker for a while now, and tried out different builds and pulled many base images. You may even have running containers at the moment. Let's take a look at the resources Docker is using currently on your machine:

```bash
$ docker system df
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          64        11        33.7GB    28.92GB (85%)
Containers      11        9         1.463GB   1.238GB (84%)
Local Volumes   60        3         9.317GB   9.196GB (98%)
Build Cache     96        0         2.29GB    2.29GB
```

This breaks down disk usage by Docker resources: images, containers, local volumes and build cache.
The "RECLAIMABLE" column tells you exactly how much space could be freed because those resources are not currently attached to any active container.

To check active resource utilization of your CPU, memory and network I/O, use:

```bash
$ docker stats
CONTAINER ID   NAME                                 CPU %     MEM USAGE / LIMIT    MEM %     NET I/O           BLOCK I/O         PIDS
10487046ace3   exampleapplication-worker-1          0.12%     529.4MiB / 15.5GiB   3.34%     5.98MB / 6.94MB   45.2MB / 25.4MB   24
29920cc47107   exampleapplication-dag-processor-1   100.19%   364.7MiB / 15.5GiB   2.30%     41.6MB / 41.2MB   101MB / 2.39MB    5
2e3536009ef1   exampleapplication-triggerer-1       1.19%     254.1MiB / 15.5GiB   1.60%     23.8MB / 34MB     47MB / 41.1MB     8
```

For granular details on a specific container's configuration, networking, or mounted volumes: `docker inspect [container-id]`.
This is a goldmine of state information and low-level configuration details of a Docker object.

Over time, the system accumulates bloat due to dangling Docker images, which are untagged image layers no longer referenced by any container. This happens rapidly when iterating on a Dockerfile or running multiple local builds. Other notable culprits include abandoned build caches and dangling volumes left behind by removed containers.

Docker provides several cleanup options, depending on how aggressively you want to *prune*:

For routine cleanups (suitable for periodic maintenance):
- `docker image prune`: removes dangling images (untagged layers).
- `docker image prune -a`: removes all images not currently referenced by at least one container.
- `docker container prune`: removes all stopped containers.

> [!WARNING]
> The following command permanently deletes unattached Docker volumes. Inspect volumes (`docker volume ls`) and confirm they contain no persistent databases or state you need before running:
> ```bash
> docker system prune -a --volumes
> ```


### 1.2 Docker Compose and developer experience

For simple scripts, a single Dockerfile is sufficient. But real-world applications almost always depend on auxiliary services: PostgreSQL, Redis, RabbitMQ, or an object store. Running these alongside the application is where [**Docker Compose**](https://docs.docker.com/compose/) shines: a lightweight orchestrator defined in a declarative `compose.yml` file.

[Deserves more details about what Compose can do for DX]

For local development, one major historical friction point was rebuilding the container image every time you edited application source code. Docker Compose solves this cleanly with [Compose Watch](https://docs.docker.com/compose/how-tos/file-watch/).

Each Compose Watch rule specifies an `action`:
- `sync`: instantly syncs changes from the host directory directly into the running container without rebuilding or restarting the process.
- `rebuild`: automatically triggers an image rebuild when dependency manifests change (e.g. `requirements.txt` or `pyproject.toml`).

Here is a typical Compose Watch setup for a Python service (such as FastAPI or Flask):

```yaml
services:
  web:
    build: .
    ports:
      - "8000:8000"
    develop:
      watch:
        # Instantly sync Python code changes into the container without rebuilding
        - action: sync
          path: ./app
          target: /app/app

        # Automatically rebuild the Docker image whenever Python dependencies change
        - action: rebuild
          path: requirements.txt
```

When coupled with an ASGI server running in reload mode (`uvicorn app.main:app --reload`), editing any Python file on your host machine instantly reflects inside the container in milliseconds.


## 2. Docker Image Optimization and Layer Auditing

> [!NOTE]
> *Before refactoring your Dockerfile*
> - **Safety First**: Ensure you have a reliable test suite (unit and integration tests) to verify behavior before and after refactoring.
> - **Baseline Measurement**: Record your baseline image size (`docker images <image-name>`) and build times (`time docker build .`). You can also inspect step-by-step elapsed time using BuildKit's plain progress output:
>   ```bash
>   DOCKER_BUILDKIT=1 docker build --progress=plain .
>   ```

Optimizing a Docker image involves balancing distinct engineering trade-offs:
- **Build Speed**: Reducing pipeline wait times in CI/CD through aggressive layer caching and package manager caches (`pip`).
- **Image Size**: Minimizing network transfer times across CI runners, container registries, and production orchestrators.
- **Security & Attack Surface**: Stripping away compilers, header files, package managers, and root access in the final runtime container.
- **Maintainability**: Clear, deterministic, and reproducible Dockerfile instructions.


### 2.1. Docker Context Discipline

The `.dockerignore` file defines which host files and directories should be excluded from the [Docker build context](https://docs.docker.com/build/concepts/context/).

Whenever you invoke `docker build .`, the Docker CLI creates an archive of everything in the build context directory and uploads it across the Docker daemon socket (or over the network to a remote CI builder). If your build context contains local Python virtual environments (`.venv`), database dumps, Git history (`.git`), or large datasets, you can easily waste gigabytes of bandwidth and dozens of seconds before line 1 of your Dockerfile even executes:

```text
# The telltale sign of an unoptimized build context:
=> [internal] load build context
=> => transferring context: 1.84GB
```

While `.gitignore` and `.dockerignore` often share common entries, their goals differ:
- **Git ignored, Docker included**: Built distribution wheels or pre-packaged artifacts needed during build.
- **Docker ignored, Git included**: Documentation, CI/CD workflow files, test suites, local test coverage reports, and Git history itself.

We strongly recommend an **Allowlist approach**:
1. Ignore everything by default (`*`).
2. Whitelist only the files and directories strictly required to build and run the application.
3. Explicitly ensure sensitive local secrets and caches remain blocked.

Here is a Python-oriented example:
```text
# 1. Ignore absolutely everything by default
*

# 2. Allow specific folders and files required to build your Python app
!app/
!src/
!requirements.txt
!requirements*.txt
!pyproject.toml
!poetry.lock
!uv.lock
!alembic.ini
!alembic/

# 3. Explicitly re-ignore Git metadata, CI directories, and local caches
.git/
.github/

# Python bytecode, compilation artifacts, and virtual environments
__pycache__/
*.py[cod]
*$py.class
*.so
.venv/
venv/
ENV/
build/
dist/
*.egg-info/

# Testing and linting caches
.pytest_cache/
.mypy_cache/
.ruff_cache/
.coverage
htmlcov/

# Environment Variables & Secrets (Crucial Security Guardrail)
.env
.env.*
*.pem
*.key

# IDEs and Editor Artifacts
.vscode/
.idea/
*.swp
```


### 2.2. Base Image Selection

Your starting point matters. The base image influences image size, build time, compatibility and attack surface. All valid Dockerfiles start with the instruction `FROM` that initializes a new build stage and sets the base image for subsequent instructions.


| Docker image | Runtime / software version | Variant | Distribution |
|---|---|---|---|
| `python:3.12` | Python 3.12 | Default | Debian-based |
| `python:3.12-slim` | Python 3.12 | Slim | Debian-based |
| `python:3.12-alpine` | Python 3.12 | Alpine | Alpine Linux |
| `postgres:18.1-alpine3.22` | PostgreSQL 18.1 | Alpine | Alpine 3.22 |


runtime version, image variants and distribution version.
What does each mean exactly? and how to make the right pick?

variants and naming conventions differ between image repositories


1. Variant: What kind of base image should I use?
2. Version: What exactly am I selecting?
3. Pinning: How do I make sure future builds use the same image?
<!-- 4. Consider the target architecture -->
<!-- 5. Choose a trusty source -->

Full, slim, Alpine, distroeless and Scratch

image tags can communicate both the application version and the underlying distribution
Implicit tag is latest when no tag is defined. Unpredictable builds.

<!-- TODO(pinning-strategy): Emphasize the anti-pattern of ':latest' and mutable major tags (e.g. 'FROM python:3.12'). If an upstream base image updates overnight with a breaking security patch or dependency bump, the final image may differ from what was tested, and CI builds can fail without any code changes. Introduce SHA-256 digest pinning ('FROM python:3.12-slim@sha256:...') for maximum immutability in regulated environments. -->


- Or you can literally start `FROM scratch`. If you are the daring adventurous type. [you will have no shell]. If you want to run a binary inside, it must be statically compiled and self-contained.

<!-- https://www.geeksforgeeks.org/devops/docker-scratch-based-images/ -->
<!-- https://docs.docker.com/build/building/base-images/#create-a-minimal-base-image-using-scratch -->



Choosing trusted sources: https://docs.docker.com/docker-hub/image-library/trusted-content/

DockerHub's Verified Publisher: https://docs.docker.com/docker-hub/image-library/trusted-content/#verified-publisher-images


### 2.3. Layer Ordering

[Properly introduce the concept of layering in docker images]
<!-- TODO(layering-intro): Explain how Docker layers actually work under the hood: each instruction in a Dockerfile (RUN, COPY, ADD) creates an immutable, read-only layer managed by the storage driver (overlay2). Docker caches each layer based on a hash of the instruction string, parent layer hash, and file checksums (for COPY/ADD). The cardinal rule of layer caching: if layer N changes, Docker invalidates the cache for layer N and ALL subsequent layers (N+1, N+2, ...). -->

-  Ordering instructions from least-frequently-changed (base OS, dependencies) to most-frequently-changed (source code) for optimal layer caching.

Caveat:
`RUN apt-get update` and install in the same line
`COPY vs ADD`
Reducing the number of layers and layer count testing
<!-- TODO(layer-rules): Replace this raw bullet list with detailed sub-sections and bad-vs-good code comparisons for the four classic layer optimization rules:
  1. Separate manifests from source code: Always run 'COPY requirements.txt ./' followed by 'RUN pip install --no-cache-dir -r requirements.txt', and ONLY THEN 'COPY . .'. Explain that code changes frequently (invalidating everything after), while dependencies change rarely.
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

### 2.4. Multi-Stage Builds

Multi-stage builds are arguably the single most effective tool for shrinking container images and reducing attack surfaces. They strictly isolate your **build environment** (C/C++ compilers, development headers, git) from your **runtime environment** (the lean interpreter and production code).

In Python for example, building native extensions often requires system packages like `build-essential`, `gcc`, `g++`, `libpq-dev`, or `python3-dev`. If you build your application in a single stage, these heavy compilers and intermediate object files remain trapped in your production image forever—increasing image size by hundreds of megabytes and expanding your CVE vulnerability footprint.

#### The Python Virtual Environment Pattern (`/opt/venv`)
The cleanest, most reliable pattern for Python multi-stage builds is to build an isolated virtual environment in the `builder` stage, and copy that virtual environment directly into the lean `runner` stage.

Here is a production-grade multi-stage Dockerfile for a Python application:

```dockerfile
# ==========================================
# Stage 1: Build & Dependency Compilation
# ==========================================
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build tools and header libraries required for compiling C-extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# Create a clean virtual environment in /opt/venv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python packages directly into the virtual environment
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements.txt


# ==========================================
# Stage 2: Lean Production Runtime
# ==========================================
FROM python:3.12-slim AS runner

WORKDIR /app

# Install ONLY runtime shared libraries (no compilers or header packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
 && rm -rf /var/lib/apt/lists/*

# Copy the isolated virtual environment from the builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Create a dedicated unprivileged user
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/bash -m appuser

# Copy application source code with non-root ownership
COPY --chown=appuser:appgroup ./app /app/app

# Switch to the non-root user
USER appuser

# Expose port and launch the ASGI server
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Why this pattern works so well:
1. **Compilers stay behind**: Tools like `gcc`, `make`, and header packages (`libpq-dev`) never touch the runner stage.
2. **Zero-effort activation**: Setting `ENV PATH="/opt/venv/bin:$PATH"` in both stages ensures that any call to `python`, `pip`, or entrypoints like `uvicorn` uses the virtual environment automatically without requiring `source /opt/venv/bin/activate`.
3. **Targeted builds for testing**: BuildKit supports targeted builds. You can run unit tests directly against the builder stage in CI without polluting the production container:
```bash
docker build --target builder -t myapp:test .
docker run --rm myapp:test pytest
```

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
  2. Secret management: Explain why 'ARG' and 'ENV' must NEVER be used for sensitive API keys, private PyPI tokens, or DB passwords (they get baked permanently into image metadata and can be viewed via 'docker history'). Provide a BuildKit secret mount snippet: 'RUN --mount=type=secret,id=pipconfig,target=/root/.config/pip/pip.conf pip install -r requirements.txt'.
  3. Read-only filesystem: Mention hardening containers at runtime using '--read-only' with tmpfs mounts ('--tmpfs /tmp --tmpfs /run') to prevent malware from persisting binaries inside a compromised container.
  4. Healthchecks: Complete the explanation of the Python healthcheck snippet. Note that 'HEALTHCHECK' instructions allow Docker and Docker Compose orchestrators to monitor container health and enforce service dependencies ('depends_on: { service: { condition: service_healthy } }') rather than just checking if the process PID is alive.

- **Non-root Execution**: Never run application processes as `root`. Create a dedicated system user (`USER appuser`) to enforce the principle of least privilege.
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
