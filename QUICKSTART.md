# Quick Start Guide - Custom WebVM with Ignition

This guide helps you build and deploy your own WebVM image with Ignition pre-installed.

## 📋 Prerequisites

- Docker installed locally
- GitHub account
- Ignition installer downloaded

---

## 🚀 Method 1: Automated (GitHub Actions)

### Step 1: Download Ignition

1. Visit: https://inductiveautomation.com/downloads/ignition/
2. Download: **Linux x64 installer** (.run file)
3. Rename to: `Ignition-linux-x64-installer.run`

### Step 2: Add to Repository

```bash
cd ignition-sandbox
# Move downloaded file here
mv ~/Downloads/Ignition-*.run ./Ignition-linux-x64-installer.run
git add Ignition-linux-x64-installer.run
git commit -m "Add Ignition installer for custom image build"
git push
```

### Step 3: GitHub Actions Builds Automatically

1. Go to: https://github.com/teslasolar/ignition-sandbox/actions
2. Watch "Build Custom WebVM Image" workflow
3. Wait 5-10 minutes for build to complete

### Step 4: Make Package Public

1. Go to: https://github.com/users/teslasolar/packages/container/package/ignition-sandbox
2. Click "Package settings"
3. Scroll to "Danger Zone"
4. Click "Change visibility" → "Public"

### Step 5: Deploy to GitHub Pages

1. Go to repo Settings → Pages
2. Source: Deploy from branch
3. Branch: `main` (or `gh-pages`)
4. Save

### Step 6: Access Your Sandbox

Visit: https://teslasolar.github.io/ignition-sandbox

**Ignition will auto-start on VM boot!** 🎉

---

## 🛠️ Method 2: Manual (Local Build)

### Step 1: Download Ignition

Same as Method 1 - place `Ignition-linux-x64-installer.run` in repo root.

### Step 2: Build Image Locally

```bash
chmod +x build-local.sh
./build-local.sh
```

This creates: `ignition-webvm:latest`

### Step 3: Test Locally (Optional)

```bash
docker run -it -p 8088:8088 ignition-webvm:latest
```

Access at: http://localhost:8088

### Step 4: Push to GitHub Container Registry

```bash
# Set GitHub token
export GITHUB_TOKEN=your_personal_access_token

# Push
chmod +x push-to-ghcr.sh
./push-to-ghcr.sh
```

Create token at: https://github.com/settings/tokens
Required scopes: `write:packages`, `read:packages`

### Step 5: Make Package Public

Same as Method 1, Step 4

### Step 6: Deploy

Same as Method 1, Steps 5-6

---

## 🧪 Testing Your Image

### Test with WebVM directly:

```
https://webvm.io/?image=ghcr.io/teslasolar/ignition-sandbox:latest
```

### Check if Ignition auto-starts:

1. VM boots
2. Terminal shows: "🚀 Starting Ignition Gateway..."
3. After ~10 seconds: "✅ Ignition Gateway is running!"
4. Open browser inside VM → `localhost:8088`
5. Login: `admin` / `password`

---

## 📁 File Structure

```
ignition-sandbox/
├── Dockerfile                          # Custom image definition
├── Ignition-linux-x64-installer.run   # Ignition installer (download)
├── build-local.sh                      # Build script
├── push-to-ghcr.sh                     # Push to registry
├── index.html                          # GitHub Pages frontend
├── .github/workflows/build-image.yml   # Auto-build workflow
└── QUICKSTART.md                       # This file
```

---

## ⚡ Key Features

### Auto-Start
Ignition starts automatically when WebVM boots. No manual commands needed!

### Persistent
Uses IndexedDB to cache VM state. Ignition data persists across sessions.

### Fast
First load: 1-2 minutes (downloads image)
Subsequent: Instant (cached)

### Portable
Share the URL - anyone can use it instantly in their browser.

---

## 🐛 Troubleshooting

### Build fails: "Ignition installer not found"

Make sure file is named exactly: `Ignition-linux-x64-installer.run`

```bash
ls -lh Ignition-linux-x64-installer.run
```

### WebVM shows "Image not found"

Package is still private. Make it public:
1. https://github.com/users/teslasolar/packages
2. Find `ignition-sandbox`
3. Settings → Change visibility → Public

### Ignition doesn't auto-start

Check the Dockerfile's `.bashrc` section. It should have:

```bash
if ! pgrep -f "ignition" > /dev/null; then
    /usr/local/bin/start-ignition.sh
fi
```

### Can't push to GHCR

Set `GITHUB_TOKEN`:

```bash
export GITHUB_TOKEN=ghp_yourTokenHere
```

Or use GitHub Actions (Method 1) instead.

---

## 📊 Image Size

- Compressed: ~600MB
- Uncompressed: ~1.5GB
- Download time: 1-3 minutes (depends on connection)

---

## 🔄 Updating

### Update Ignition Version

1. Download new installer
2. Replace `Ignition-linux-x64-installer.run`
3. Commit and push
4. GitHub Actions rebuilds automatically

### Update Configuration

Edit `Dockerfile`:
- Change ports
- Add environment variables
- Install additional packages
- Modify auto-start behavior

Then rebuild and push.

---

## 📚 Resources

- **WebVM**: https://webvm.io
- **Ignition Docs**: https://docs.inductiveautomation.com
- **GHCR Docs**: https://docs.github.com/packages
- **Docker Docs**: https://docs.docker.com

---

## ⚖️ License

- **Ignition**: Trial mode (2-hour reset) - Contact Inductive Automation for licensing
- **WebVM**: Apache 2.0
- **This Project**: MIT

---

**Need help?** Open an issue at: https://github.com/teslasolar/ignition-sandbox/issues
