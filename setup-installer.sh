#!/bin/bash
set -e

echo "📦 Ignition Installer Setup for GitHub Releases"
echo ""
echo "STEP 1: Download Ignition Installer"
echo "----------------------------------------"
echo "1. Visit: https://inductiveautomation.com/downloads/ignition/"
echo "2. Download: Ignition 8.1.x Linux x64 installer (.run file)"
echo "3. Save it to this directory as: Ignition-linux-x64-installer.run"
echo ""
read -p "Press ENTER once you've downloaded the file..."

# Check if file exists
if [ ! -f "Ignition-linux-x64-installer.run" ]; then
    echo "❌ File not found: Ignition-linux-x64-installer.run"
    echo "Please download it and try again."
    exit 1
fi

echo ""
echo "STEP 2: Create GitHub Release"
echo "----------------------------------------"

# Create release with the installer
gh release create v1.0-ignition \
    Ignition-linux-x64-installer.run \
    --title "Ignition 8.1 Installer" \
    --notes "Ignition Gateway Linux x64 installer for WebVM sandbox"

echo ""
echo "✅ Done! Installer uploaded to GitHub Releases"
echo ""
echo "The installer is now available at:"
echo "https://github.com/teslasolar/ignition-sandbox/releases/download/v1.0-ignition/Ignition-linux-x64-installer.run"
echo ""
echo "STEP 3: Update ignition-install.sh"
echo "----------------------------------------"
echo "Updating download URL in installation script..."

# Update the ignition-install.sh script
sed -i 's|https://files.inductiveautomation.com/release/ia/8.1.43/Ignition-8.1.43-linux-x64-installer.run|https://github.com/teslasolar/ignition-sandbox/releases/download/v1.0-ignition/Ignition-linux-x64-installer.run|g' ignition-install.sh

echo "✅ Script updated!"
echo ""
echo "STEP 4: Commit and push changes"
echo "----------------------------------------"
git add ignition-install.sh
git commit -m "Update Ignition installer to use GitHub Releases"
git push

echo ""
echo "🚀 All done! Your sandbox now uses the GitHub-hosted installer."
