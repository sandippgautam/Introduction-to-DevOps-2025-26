# Practical Assignment Report: Creating a DevOps Environment for Company X

**Student:** Sandip Gautam  
**Course:** Introduction to DevOps 2025-26  
**Date:** June 2026  

---

## 1. Introduction

This report documents the implementation of a modern DevOps environment for Company X, a software company currently deploying a Node.js web application manually to a dedicated Ubuntu 16.04 server. The goal was to design and implement a complete CI/CD pipeline enabling automated testing and deployment, proper version control workflows, and cloud-hosted application delivery.

---

## 2. Current State Analysis

**Problems identified with Company X's current setup:**
- Manual monthly deployments create slow release cycles
- No structured version control workflow leads to merge conflicts and collaboration issues
- Single person dependency for deployments (bus factor = 1)
- Ubuntu 16.04 is end-of-life (security risk)
- No automated testing before deployment
- Competitors are deploying multiple times per day

---

## 3. Proposed DevOps Environment

### 3.1 Version Control Strategy

**Adopted Workflow: Feature Branch Workflow**

The feature branch workflow was selected because:
- Each feature is developed in an isolated branch
- Main branch always contains stable, deployable code
- Merge requests enable peer code review
- Conflicts are detected early before merging to main

**Branch Structure:**
- `main` — production-ready code, triggers CI/CD
- `feature_X` — individual feature branches
- Merges done via Merge Requests (MR)

### 3.2 CI/CD Pipeline (GitLab CI/CD)

**Pipeline Stages:**

| Stage | Purpose |
|-------|---------|
| Test  | Run automated tests (npm test) |
| Build | Build and push Docker image to GitLab Container Registry |
| Deploy | Trigger Azure Web App to pull latest container image |

### 3.3 Cloud Environment (Microsoft Azure)

- **Service:** Azure Web App for Containers
- **Container Source:** GitLab Container Registry
- **Auto-deploy:** Configured via GitLab webhook on deployment events

---

## 4. Implementation Steps

### Step 1: Fork Repository and Unlink Fork

1. Navigated to the original course repository on GitLab
2. Clicked **Fork** to create a personal copy under the account
3. To unlink the fork relationship:
   - Went to **Settings → General → Advanced**
   - Scrolled to **Remove fork relationship**
   - Clicked **Remove fork relationship** and confirmed
4. Set repository visibility to **Public**

### Step 2: Create Merge Request from feature_3 to main

1. In the forked repository, navigated to **Merge Requests → New Merge Request**
2. Set source branch: `feature_3`, target branch: `main`
3. Filled in MR title and description
4. Submitted the merge request

### Step 3: Resolve Merge Conflict (Keep Both feature_3 and feature_4)

A merge conflict was detected in `app.js`. The conflict markers looked like:

```
<<<<<<< HEAD (main - contains feature_4)
app.get('/feature4', (req, res) => {
  res.send('Feature 4 is working!');
});
=======
app.get('/feature3', (req, res) => {
  res.send('Feature 3 is working!');
});
>>>>>>> feature_3
```

**Resolution:** Manually edited to keep both features:

```javascript
app.get('/feature3', (req, res) => {
  res.send('Feature 3 is working!');
});

app.get('/feature4', (req, res) => {
  res.send('Feature 4 is working!');
});
```

The merge was committed and the MR was completed.

### Step 4: Create New Branch to Fix Dockerfile and .gitlab-ci.yml

Created branch `fix/dockerfile-and-ci`:

```bash
git checkout -b fix/dockerfile-and-ci
```

**Dockerfile Fixes:**

Original issues:
- Wrong base image (outdated Node version)
- Missing `WORKDIR` directive
- Incorrect `CMD` instruction

Fixed Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

**.gitlab-ci.yml Fixes:**

Original issues:
- Missing `$CI_REGISTRY` login in build stage
- Wrong Docker image version
- Missing `docker:dind` service for Docker-in-Docker builds

Fixed pipeline (3 stages: test, build, deploy).

### Step 5: Merge Fix Branch into Main

1. Created Merge Request from `fix/dockerfile-and-ci` → `main`
2. Reviewed the changes
3. Merged the MR

### Step 6: Detect and Fix Application Configuration Error

**Error detected via pipeline logs:**

The pipeline failed at the test stage with:
```
Error: Cannot find module 'express'
```

**Root cause:** The `package.json` had `express` listed under `devDependencies` instead of `dependencies`, so `npm install --production` skipped it.

**Fix:** Moved `express` to the `dependencies` section in `package.json`:

```json
{
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

Another error found: The `app.js` was listening on a hardcoded port `8080` while Azure expects port `3000` (or whatever `process.env.PORT` provides). Fixed to:

```javascript
const port = process.env.PORT || 3000;
```

### Step 7: Verify Pipeline Publishes to GitLab Container Registry

After fixes, pipeline ran successfully:
- ✅ **Test stage:** `npm test` passed
- ✅ **Build stage:** Docker image built and pushed to `registry.gitlab.com/<username>/<project>:latest`
- ✅ **Deploy stage:** Azure webhook triggered

Verified in GitLab: **Deploy → Container Registry** showed the `latest` and commit SHA tagged images.

### Step 8: Create Azure Web App for Containers

1. Logged into **portal.azure.com**
2. Clicked **Create a resource → Web App**
3. Configured:
   - **Resource Group:** `devops-assignment-rg`
   - **Name:** `company-x-webapp` (must be globally unique)
   - **Publish:** Docker Container
   - **OS:** Linux
   - **Region:** West Europe (or closest available)
   - **App Service Plan:** Free tier (F1)
4. On the **Docker** tab:
   - **Image Source:** Docker Hub was changed to **Private Registry**
   - **Server URL:** `https://registry.gitlab.com`
   - **Username:** GitLab username
   - **Password:** GitLab Personal Access Token (with `read_registry` scope)
   - **Image and tag:** `registry.gitlab.com/<username>/<project>:latest`
5. Clicked **Review + Create** → **Create**

### Step 9: Configure GitLab Webhook for Auto-Deploy

1. In Azure Web App: **Settings → Configuration → General Settings**
   - Enabled **Continuous Deployment** (CD) toggle → This generated a **Webhook URL**
   - Copied the webhook URL

2. In GitLab repository: **Settings → Webhooks**
   - **URL:** Pasted the Azure webhook URL
   - **Trigger:** Checked **Pipeline events**
   - Clicked **Add webhook**

3. Tested the webhook via **Test → Pipeline events** — received HTTP 200 response.

### Step 10: Verify Full Pipeline with Feature 5

Created a new feature branch and added Feature 5:

```bash
git checkout -b feature_5
# Added feature5 route to app.js
git add app.js
git commit -m "Add feature 5 to the application"
git push origin feature_5
```

Created Merge Request: `feature_5` → `main`
- Pipeline ran on the MR (test stage only)
- Merged the MR
- Pipeline triggered on `main`: test ✅, build ✅, deploy ✅
- Azure Web App automatically pulled the new image
- Verified at `https://company-x-webapp.azurewebsites.net/feature5` → **Feature 5 is working!**

---

## 5. Designed DevOps Environment Architecture

```
Developer (Local)
      |
      | git push (feature branch)
      v
GitLab Repository
      |
      | Merge Request → Review → Merge to main
      v
GitLab CI/CD Pipeline
   [Test] → [Build] → [Deploy]
      |          |          |
   npm test   Docker     Webhook
              build &    call to
              push to    Azure
              Registry
                |
                v
        GitLab Container Registry
                |
                v (Azure pulls new image)
        Azure Web App for Containers
                |
                v
        Public URL: https://company-x-webapp.azurewebsites.net
```

---

## 6. Version Control Workflow Recommendations

For Company X going forward:

1. **Never commit directly to main** — always use feature branches
2. **Require MR approvals** — at least 1 reviewer before merging
3. **Protect the main branch** in GitLab settings
4. **Use semantic commit messages:** `feat:`, `fix:`, `docs:`, `chore:`
5. **Tag releases** for production deployments

---

## 7. Discussion

### Benefits Achieved

| Before | After |
|--------|-------|
| Monthly manual deploys | Automated deploy on every merge to main |
| No version control structure | Feature branch workflow enforced |
| Single person can deploy | Any team member can trigger via MR |
| No testing | Automated tests run on every pipeline |
| Manual server access needed | Fully automated via GitLab + Azure |

### Challenges Encountered

1. **Merge conflict resolution** — Required careful manual editing to keep both feature_3 and feature_4
2. **Docker-in-Docker setup** — Required `docker:dind` service and `DOCKER_TLS_CERTDIR` variable
3. **Azure Container Registry settings** — "Full Image Name and Tag" option was inconsistent; used server URL + image separately
4. **Cold start delays in Azure** — Free tier Azure apps "sleep" when idle; first request after inactivity can take 30+ seconds

---

## 8. Conclusion

The implementation successfully transformed Company X's deployment process from a manual, monthly operation to an automated CI/CD pipeline capable of deploying multiple times per day. The feature branch workflow provides structure to version control, automated testing prevents regressions, and Azure Web App for Containers provides scalable cloud hosting. The company can now deploy as frequently as their competitors.

---

## Appendix: Links

- **Repository URL:** https://gitlab.com/[your-username]/[project-name]
- **Application URL:** https://[your-app-name].azurewebsites.net
- **Demo Video:** [Link to video]

---

*Report prepared for Introduction to DevOps 2025-26, LUT University*
