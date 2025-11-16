#!/bin/bash
set -e

echo "📤 Pushing to GitHub Container Registry"
echo "========================================"
echo ""

# Get GitHub username
GITHUB_USER="teslasolar"
REPO_NAME="ignition-sandbox"
IMAGE_NAME="ghcr.io/${GITHUB_USER}/${REPO_NAME}:latest"

echo "🏷️  Image will be tagged as:"
echo "   $IMAGE_NAME"
echo ""

# Check if image exists locally
if ! docker image inspect ignition-webvm:latest &> /dev/null; then
    echo "❌ ERROR: Local image 'ignition-webvm:latest' not found"
    echo ""
    echo "Build it first:"
    echo "   ./build-local.sh"
    echo ""
    exit 1
fi

echo "✅ Local image found"
echo ""

# Check if logged in to GHCR
echo "🔐 Checking GitHub Container Registry login..."
if ! docker login ghcr.io --username $GITHUB_USER --password-stdin <<< "$GITHUB_TOKEN" 2>&1 | grep -q "Login Succeeded"; then
    echo ""
    echo "⚠️  Not logged in to GHCR"
    echo ""
    echo "Please set GITHUB_TOKEN environment variable:"
    echo "   export GITHUB_TOKEN=your_personal_access_token"
    echo ""
    echo "Or login manually:"
    echo "   echo \$GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USER --password-stdin"
    echo ""
    echo "Create token at: https://github.com/settings/tokens"
    echo "Required scopes: write:packages, read:packages"
    echo ""
    exit 1
fi

echo "✅ Logged in to GHCR"
echo ""

# Tag image
echo "🏷️  Tagging image..."
docker tag ignition-webvm:latest $IMAGE_NAME

# Push image
echo "📤 Pushing to registry..."
echo "   (This may take 5-10 minutes depending on connection)"
echo ""

docker push $IMAGE_NAME

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "✅ Push Complete!"
    echo "================================================"
    echo ""
    echo "📦 Image: $IMAGE_NAME"
    echo ""
    echo "🔓 Make package public:"
    echo "   1. Go to: https://github.com/users/${GITHUB_USER}/packages/container/package/${REPO_NAME}"
    echo "   2. Click 'Package settings'"
    echo "   3. Change visibility to 'Public'"
    echo ""
    echo "🧪 Test with WebVM:"
    echo "   https://webvm.io/?image=$IMAGE_NAME"
    echo ""
    echo "🌐 Update index.html to use this image, then deploy to GitHub Pages"
    echo ""
else
    echo ""
    echo "❌ Push failed!"
    exit 1
fi
