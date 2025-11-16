# Deployment Guide - Ignition Browser Sandbox

This guide walks through deploying a custom WebVM image with Ignition pre-installed.

## 🎯 Overview

The deployment process:
1. Build a custom Docker image with Ignition pre-installed
2. Publish to GitHub Container Registry (GHCR)
3. WebVM loads your custom image automatically
4. Users get Ignition ready-to-use in seconds

## 📋 Prerequisites

- GitHub account with repo access
- (Optional) Docker installed locally for testing
- Ignition installer downloaded from InductiveAutomation.com

## 🚀 Quick Deploy (Automated)

### Option A: GitHub Actions (Recommended)

GitHub Actions will automatically build and publish your image:

1. **Download Ignition Installer**
   ```bash
   # Visit: https://inductiveautomation.com/downloads/ignition/
   # Download: Linux x64 installer
   # Save to repo as: Ignition-linux-x64-installer.run
   ```

2. **Update Dockerfile**
   Uncomment the COPY line in `Dockerfile`:
   ```dockerfile
   COPY Ignition-linux-x64-installer.run /tmp/ignition-installer.run
   ```

3. **Commit and Push**
   ```bash
   git add Ignition-linux-x64-installer.run Dockerfile
   git commit -m "Add Ignition installer"
   git push
   ```

4. **GitHub Actions Builds Image**
   - Go to Actions tab on GitHub
   - Watch "Build WebVM Image" workflow
   - Image published to: `ghcr.io/teslasolar/ignition-sandbox/webvm:latest`

5. **Enable GitHub Pages**
   ```bash
   # In repo Settings → Pages
   # Source: Deploy from branch
   # Branch: gh-pages or main
   ```

6. **Done!**
   Visit: https://teslasolar.github.io/ignition-sandbox

---

## 🛠️ Manual Build (Local Testing)

### 1. Download Ignition

```bash
# Visit IA website and download, then:
mv ~/Downloads/Ignition-*.run ./Ignition-linux-x64-installer.run
```

### 2. Build Docker Image

```bash
chmod +x build-webvm-image.sh
./build-webvm-image.sh
```

### 3. Test Locally

```bash
docker run -it -p 8088:8088 ignition-webvm:latest
```

### 4. Publish to GHCR

```bash
# Tag image
docker tag ignition-webvm:latest ghcr.io/teslasolar/ignition-sandbox/webvm:latest

# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u teslasolar --password-stdin

# Push
docker push ghcr.io/teslasolar/ignition-sandbox/webvm:latest
```

### 5. Make Package Public

1. Go to: https://github.com/users/teslasolar/packages/container/ignition-sandbox%2Fwebvm
2. Click "Package settings"
3. Scroll to "Danger Zone"
4. Change visibility to "Public"

---

## 🔧 Configuration

### Custom Ignition Settings

Edit `ignition-install.sh` to customize:

```bash
# Change ports
gateway.http.port=8088    # Change to your port
gateway.https.port=8043

# Add license
# Copy your license file to the image
```

### WebVM Parameters

Modify `index.html` to add WebVM parameters:

```javascript
document.getElementById('vm').src =
  'https://webvm.io/' +
  '?image=ghcr.io/teslasolar/ignition-sandbox/webvm:latest' +
  '&env=CUSTOM_VAR=value';  // Add custom env vars
```

---

## 📦 What Gets Built

### Docker Image Contents:
- Debian Bullseye base
- Java 11 JRE
- Ignition Gateway 8.1.x
- Pre-configured for port 8088
- Auto-start scripts

### Image Size:
- Compressed: ~800MB
- Uncompressed: ~2GB
- First load: ~1-2 minutes
- Subsequent: Instant (cached)

---

## 🐛 Troubleshooting

### Image Won't Build

**Issue**: GitHub Actions fails on Dockerfile
```bash
# Check logs in Actions tab
# Common issues:
# - Ignition installer not found
# - Missing COPY command in Dockerfile
```

**Fix**:
```bash
# Make sure Dockerfile has:
COPY Ignition-linux-x64-installer.run /tmp/ignition-installer.run
```

### WebVM Shows "Image Not Found"

**Issue**: GHCR package is private

**Fix**:
1. Go to package settings on GitHub
2. Make package public
3. Ensure URL is correct: `ghcr.io/teslasolar/ignition-sandbox/webvm:latest`

### Ignition Won't Start

**Issue**: Java or ports misconfigured

**Fix**:
```bash
# SSH into WebVM and check:
/opt/ignition/ignition.sh status
journalctl -u ignition  # Check logs
netstat -tulpn | grep 8088  # Check port
```

---

## 🔄 Updates

### Update Ignition Version

1. Download new installer
2. Replace `Ignition-linux-x64-installer.run`
3. Commit and push
4. GitHub Actions rebuilds automatically

### Update Configuration

1. Edit `ignition-install.sh` or `Dockerfile`
2. Commit and push
3. New image builds automatically

---

## 📚 Resources

- **WebVM Docs**: https://webvm.io
- **Ignition Docs**: https://docs.inductiveautomation.com
- **GHCR Docs**: https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry
- **Docker Docs**: https://docs.docker.com

---

## ⚖️ License & Legal

- **Ignition**: Trial mode (2-hour reset) - Check IA licensing
- **WebVM**: Apache 2.0
- **This Repo**: MIT License

**Note**: Hosting Ignition installer may require InductiveAutomation approval. For production use, contact Inductive Automation for proper licensing.
