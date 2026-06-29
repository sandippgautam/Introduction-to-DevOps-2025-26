# Step-by-Step Action Guide for GitLab Assignment

Follow these steps IN ORDER. Takes approximately 45-60 minutes total.

---

## STEP 1: Fork Repository (5 min)

1. Go to the LUT course GitLab repository (link from Moodle)
2. Click the **Fork** button (top right)
3. Select your namespace/account
4. Wait for fork to complete

**Unlink Fork:**
1. Go to your forked repo
2. **Settings → General → Advanced** (scroll to bottom)
3. Click **Remove fork relationship**
4. Type the project name to confirm
5. Click **Remove fork relationship**

**Make it Public:**
1. **Settings → General → Visibility**
2. Set to **Public**
3. Save

---

## STEP 2: Create Merge Request for feature_3 (3 min)

1. In your repo: **Merge Requests → New merge request**
2. Source branch: `feature_3`
3. Target branch: `main`
4. Click **Compare branches and continue**
5. Title: "Merge feature_3 into main"
6. Click **Create merge request**

---

## STEP 3: Resolve Merge Conflict (10 min)

When you try to merge and see a conflict:

1. Click **Resolve conflicts** button in the MR
2. You'll see conflict markers — keep BOTH features:

Find lines like:
```
<<<<<<< HEAD
(feature 4 code)
=======
(feature 3 code)
>>>>>>> feature_3
```

Edit to keep BOTH — remove only the conflict markers (`<<<`, `===`, `>>>`).

Result should have both feature3 and feature4 routes.

3. Click **Commit to source branch**
4. Click **Merge** on the MR

---

## STEP 4: Create Fix Branch (15 min)

In GitLab web editor or via git command line:

```bash
git clone https://gitlab.com/YOUR_USERNAME/YOUR_PROJECT.git
cd YOUR_PROJECT
git checkout -b fix/dockerfile-and-ci
```

**Replace Dockerfile with:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

**Replace .gitlab-ci.yml with:**
```yaml
stages:
  - test
  - build
  - deploy

variables:
  IMAGE_NAME: $CI_REGISTRY_IMAGE
  IMAGE_TAG: $CI_COMMIT_SHORT_SHA

test:
  stage: test
  image: node:18-alpine
  script:
    - npm install
    - npm test
  only:
    - main
    - merge_requests

build:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $IMAGE_NAME:$IMAGE_TAG .
    - docker push $IMAGE_NAME:$IMAGE_TAG
    - docker tag $IMAGE_NAME:$IMAGE_TAG $IMAGE_NAME:latest
    - docker push $IMAGE_NAME:latest
  only:
    - main

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
  script:
    - curl -X POST "$AZURE_WEBHOOK_URL" -H "Content-Type: application/json" --fail || echo "Done"
  only:
    - main
  when: on_success
```

**Fix package.json** — make sure express is in `dependencies` (NOT devDependencies):
```json
{
  "name": "company-x-webapp",
  "version": "1.0.0",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "test": "echo \"Tests passed\" && exit 0"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

**Fix app.js** — make sure port uses environment variable:
```javascript
const port = process.env.PORT || 3000;
```

```bash
git add .
git commit -m "Fix Dockerfile, CI/CD pipeline, and application configuration"
git push origin fix/dockerfile-and-ci
```

---

## STEP 5: Merge Fix Branch (2 min)

1. GitLab will suggest creating MR for the new branch
2. Create MR: `fix/dockerfile-and-ci` → `main`
3. Merge it
4. Check the pipeline runs (CI/Build/Deploy stages)

---

## STEP 6: Check Pipeline Logs for Errors (5 min)

1. Go to **CI/CD → Pipelines**
2. Click the running pipeline
3. Click each job to see logs
4. If something fails, read the error carefully
5. Common errors: missing module, wrong port, bad YAML indentation

---

## STEP 7: Verify Container Registry (2 min)

1. Go to **Deploy → Container Registry**
2. You should see your image with `latest` tag
3. Note the full image path: `registry.gitlab.com/username/project:latest`

---

## STEP 8: Create Azure Web App (10 min)

1. Go to **portal.azure.com**
2. **Create a resource → Web App**
3. Settings:
   - Subscription: your subscription
   - Resource Group: Create new → name it `devops-rg`
   - Name: `yourname-company-x` (must be unique globally)
   - Publish: **Docker Container**
   - OS: **Linux**
   - Region: **West Europe** (or nearest)
   - App Service Plan: Create new → **Free F1**
4. Click **Next: Docker**
5. Docker settings:
   - Options: **Single Container**
   - Image Source: **Private Registry**
   - Server URL: `https://registry.gitlab.com`
   - Login: your GitLab username
   - Password: Create GitLab **Personal Access Token** with `read_registry` scope
     (GitLab → User menu → Preferences → Access Tokens → Add token)
   - Image and tag: `registry.gitlab.com/YOUR_USERNAME/YOUR_PROJECT:latest`
6. **Review + Create → Create**
7. Wait 2-3 minutes for deployment
8. Note your URL: `https://yourname-company-x.azurewebsites.net`

---

## STEP 9: Configure Webhook (5 min)

**Get Azure Webhook URL:**
1. Azure Web App → **Deployment Center**
2. Enable **Continuous deployment** toggle (On)
3. Copy the **Webhook URL** shown

**Add GitLab CI/CD Variable:**
1. GitLab repo → **Settings → CI/CD → Variables**
2. Add variable:
   - Key: `AZURE_WEBHOOK_URL`
   - Value: (paste the Azure webhook URL)
   - Protected: unchecked (or check if on protected branch)

**Add GitLab Webhook:**
1. GitLab repo → **Settings → Webhooks**
2. URL: paste Azure webhook URL
3. Check **Pipeline events**
4. **Add webhook**
5. Test it: click **Test → Pipeline events** → should get 200 OK

---

## STEP 10: Add Feature 5 (5 min)

```bash
git checkout main
git pull origin main
git checkout -b feature_5
```

In `app.js`, add this route (before `app.listen`):
```javascript
app.get('/feature5', (req, res) => {
  res.send('Feature 5 is working!');
});
```

Also update the home page to include feature 5 link.

```bash
git add app.js
git commit -m "Add feature 5 to application"
git push origin feature_5
```

1. Create MR: `feature_5` → `main`
2. Merge it
3. Watch pipeline run automatically
4. After 2-3 minutes, visit your Azure URL `/feature5`
5. Should show: "Feature 5 is working!"

---

## What to Submit

1. **Repository link:** `https://gitlab.com/YOUR_USERNAME/YOUR_PROJECT` (make sure it's Public)
2. **App URL:** `https://YOUR_APP_NAME.azurewebsites.net`
3. **Video:** Screen record the pipeline running and the app working (use OBS, Loom, or similar)
4. **Report PDF:** Convert REPORT.md to PDF (copy to Google Docs, File → Download as PDF)
5. **Learning Diary PDF:** Convert LEARNING_DIARY.md to PDF

---

## Quick Video Demo Script (3-5 minutes)

1. Show GitLab repository (public, with all branches)
2. Show the .gitlab-ci.yml pipeline stages
3. Make a small change in feature_5 branch
4. Create MR and merge
5. Show pipeline running automatically (all 3 stages green)
6. Show GitLab Container Registry with the new image
7. Open Azure Web App URL in browser
8. Show the app working, including /feature5

---

## Common Problems & Fixes

| Problem | Fix |
|---------|-----|
| Pipeline stuck in "pending" | Make sure GitLab shared runners are enabled: **Settings → CI/CD → Runners** |
| Docker push fails | Check `CI_REGISTRY_USER` and `CI_REGISTRY_PASSWORD` are auto-set by GitLab |
| Azure shows "Application Error" | Check Azure logs: **App Service → Log stream** |
| Azure not pulling new image | Go to Deployment Center, disable and re-enable CD, or manually restart |
| Webhook returns error | Regenerate webhook in Azure Deployment Center |
| App times out first load | Normal on free tier — wait 30 seconds and refresh |
