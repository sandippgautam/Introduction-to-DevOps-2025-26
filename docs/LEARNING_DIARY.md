# Learning Diary – Introduction to DevOps 2025-26

**Student:** Sandip Gautam  
**Course:** Introduction to DevOps 2025-26  
**Institution:** LUT University  

---

## Module 1: Introduction to DevOps

**What I learned:**

DevOps is a cultural and technical movement that bridges the gap between software development (Dev) and IT operations (Ops). The core idea is to shorten the development lifecycle while maintaining high software quality.

Key concepts learned:
- The traditional "wall of confusion" between Dev and Ops teams
- DevOps practices: CI/CD, Infrastructure as Code, monitoring, collaboration
- The DevOps lifecycle: Plan → Code → Build → Test → Release → Deploy → Operate → Monitor
- Why companies like Company X struggle without DevOps: slow releases, manual errors, knowledge silos

**Personal reflection:**

Before this module I thought DevOps was just about automation tools. I now understand it is primarily a culture shift. The tools (GitLab, Docker, Azure) support the culture but cannot replace it. The idea that developers should care about operations and vice versa makes complete sense — software is only valuable when it runs in production.

---

## Module 2: Version Control (Git)

**What I learned:**

- Distributed version control: every developer has a full copy of the repository
- Git branching strategies: feature branches, Gitflow, trunk-based development
- Merge conflicts: what causes them and how to resolve them
- Pull Requests / Merge Requests as a code review mechanism
- The difference between `git merge` and `git rebase`

**Practical experience:**

In the assignment I resolved a merge conflict between `feature_3` and `feature_4` branches. Initially I was confused about the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`). After understanding that they show the two versions of conflicting code, I manually edited the file to keep both features and committed the resolved state.

I also practiced the feature branch workflow — creating branches, making commits, opening merge requests, and merging to main. This workflow makes collaboration much cleaner than everyone working on main directly.

**Key takeaway:** Never commit directly to main. Feature branches protect the stable codebase and enable parallel development without interference.

---

## Module 3: Container Technologies (Docker)

**What I learned:**

- What containers are and why they solve the "works on my machine" problem
- Docker architecture: Docker Engine, images, containers, registry
- Writing Dockerfiles: `FROM`, `WORKDIR`, `COPY`, `RUN`, `EXPOSE`, `CMD`
- Docker layers and build caching
- Container registries: Docker Hub, GitLab Container Registry
- `docker build`, `docker run`, `docker push`, `docker pull`

**Practical experience:**

I fixed the Dockerfile for Company X's application. The original had issues:
1. Outdated Node.js base image
2. Missing WORKDIR — files were scattered in the root
3. Wrong CMD format

The fixed Dockerfile uses `node:18-alpine` (lightweight and current), sets a proper working directory, copies package files first for better layer caching, and uses the exec form of CMD.

I also learned that order matters in Dockerfiles — copying `package.json` before source files means npm install is cached unless dependencies change, which speeds up builds significantly.

**Key takeaway:** Containers make applications portable and consistent across environments. The same Docker image runs identically on a developer's laptop, CI server, and production cloud.

---

## Module 4: Cloud Environments (Microsoft Azure)

**What I learned:**

- Cloud computing models: IaaS, PaaS, SaaS
- Azure services overview: VMs, App Services, Container instances, AKS
- Azure Web App for Containers: running containerized apps without managing infrastructure
- Azure resource groups: logical groupings for managing related resources
- Azure Portal navigation and resource creation

**Practical experience:**

Setting up Azure Web App for Containers was more challenging than expected. The Container Registry configuration in Azure had some quirks — the "Full Image Name and Tag" option was inconsistent. I learned to:
1. Configure the Server URL as `https://registry.gitlab.com`
2. Add credentials separately
3. Use just the image path without the registry hostname in the image field

The free tier (F1) App Service Plan causes "cold start" delays when the app hasn't been accessed for a while. This is Azure conserving resources by stopping idle containers. In production, a paid tier with "Always On" would be used.

**Key takeaway:** PaaS offerings like Azure Web App dramatically reduce operational burden. Instead of managing servers, OS updates, and networking, I just provide a container image and Azure handles the rest.

---

## Module 5: CI/CD (GitLab CI/CD)

**What I learned:**

- What CI (Continuous Integration) and CD (Continuous Deployment) mean
- GitLab CI/CD: `.gitlab-ci.yml` structure, stages, jobs, runners
- GitLab Container Registry for storing Docker images
- Pipeline variables: `$CI_REGISTRY`, `$CI_REGISTRY_USER`, `$CI_REGISTRY_PASSWORD`, `$CI_COMMIT_SHORT_SHA`
- Docker-in-Docker (DinD) for building images inside CI pipelines
- Webhooks for triggering external services after deployment

**Practical experience:**

The `.gitlab-ci.yml` had several errors:
- Missing Docker login step before pushing to registry
- Wrong Docker service version for DinD
- Missing `DOCKER_TLS_CERTDIR` variable needed for Docker 20+

Debugging using pipeline logs was essential. The logs showed exactly where each step failed and what the error message was. Without reading the logs carefully, I would not have found the `express` module being in `devDependencies` instead of `dependencies`.

After fixing everything, the pipeline automatically:
1. Ran tests
2. Built a Docker image tagged with the commit SHA
3. Pushed to GitLab Container Registry
4. Triggered Azure to pull the new image

**Key takeaway:** CI/CD transforms the deployment from a manual, error-prone process to a repeatable, automated pipeline. Every merge to main automatically becomes a deployed feature in production — this is exactly what Company X needed to match competitors deploying multiple times per day.

---

## Overall Reflection

This course gave me hands-on experience with the full DevOps toolchain. The assignment was challenging but realistic — the intentional errors in the Dockerfile and application simulated real-world debugging scenarios.

The most valuable lesson was understanding how all the pieces connect:
- **Git** provides version control and collaboration structure
- **Docker** packages the application consistently
- **GitLab CI/CD** automates testing and building
- **Azure** provides scalable, managed hosting

Without any single piece, the pipeline breaks down. DevOps is about the entire chain working together smoothly, which requires both technical skills and team discipline.

I also appreciated the "fail fast" philosophy of CI/CD: catching the `express` dependency error in the CI pipeline (instead of in production at 2 AM) illustrates exactly why automated pipelines matter.

---

*Learning diary for Introduction to DevOps 2025-26, LUT University*
