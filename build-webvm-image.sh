#!/bin/bash
set -e

echo "🔨 Building Custom WebVM Image with Ignition"
echo "=============================================="
echo ""

# Check if Ignition installer exists
if [ ! -f "Ignition-linux-x64-installer.run" ]; then
    echo "⚠️  Ignition installer not found!"
    echo ""
    echo "Please download it first:"
    echo "1. Visit: https://inductiveautomation.com/downloads/ignition/"
    echo "2. Download: Linux x64 installer (.run file)"
    echo "3. Save as: Ignition-linux-x64-installer.run"
    echo ""
    read -p "Press ENTER to continue without installer (manual install required)..."
fi

echo "Step 1: Building Docker image..."
docker build -t ignition-webvm:latest .

echo ""
echo "Step 2: Converting to WebVM format..."
echo "(This requires CheerpX/WebVM tools - see docs)"
echo ""
echo "Options for deployment:"
echo ""
echo "Option A: Use with WebVM cloud builder"
echo "  1. Push to Docker Hub: docker push yourusername/ignition-webvm:latest"
echo "  2. Use URL: https://webvm.io/?image=yourusername/ignition-webvm:latest"
echo ""
echo "Option B: Use GitHub Container Registry (recommended)"
echo "  1. Tag: docker tag ignition-webvm:latest ghcr.io/teslasolar/ignition-webvm:latest"
echo "  2. Login: echo \$GITHUB_TOKEN | docker login ghcr.io -u teslasolar --password-stdin"
echo "  3. Push: docker push ghcr.io/teslasolar/ignition-webvm:latest"
echo "  4. Use: https://webvm.io/?image=ghcr.io/teslasolar/ignition-webvm:latest"
echo ""
echo "Option C: GitHub Actions (automated - recommended)"
echo "  - Workflow will auto-build and publish on push"
echo "  - Just commit and push your changes"
echo ""

read -p "Build complete! Press ENTER to continue..."
