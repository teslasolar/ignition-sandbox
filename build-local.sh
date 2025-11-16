#!/bin/bash
set -e

echo "🔨 Building Ignition WebVM Image Locally"
echo "=========================================="
echo ""

# Check if Ignition installer exists
if [ ! -f "Ignition-linux-x64-installer.run" ]; then
    echo "❌ ERROR: Ignition installer not found!"
    echo ""
    echo "📥 Please download first:"
    echo "   1. Visit: https://inductiveautomation.com/downloads/ignition/"
    echo "   2. Download: Linux x64 installer (.run file)"
    echo "   3. Save as: Ignition-linux-x64-installer.run"
    echo ""
    exit 1
fi

echo "✅ Ignition installer found"
echo ""

# Get file size
SIZE=$(du -h Ignition-linux-x64-installer.run | cut -f1)
echo "📦 Installer size: $SIZE"
echo ""

# Build Docker image
echo "🔨 Building Docker image..."
echo "   (This may take 5-10 minutes)"
echo ""

docker build -t ignition-webvm:latest .

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "✅ Build Complete!"
    echo "================================================"
    echo ""
    echo "📦 Image: ignition-webvm:latest"
    echo ""
    echo "🧪 Test locally:"
    echo "   docker run -it -p 8088:8088 ignition-webvm:latest"
    echo ""
    echo "📤 Push to GitHub Container Registry:"
    echo "   ./push-to-ghcr.sh"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi
