#!/bin/bash
set -e

echo '================================================'
echo '🔧 Installing Ignition Gateway...'
echo '================================================'
echo ''

# Update package list and install dependencies
echo '📦 Installing dependencies...'
apt-get update -qq 2>&1 | grep -v "^Reading" || true
apt-get install -y wget openjdk-11-jre-headless unzip curl 2>&1 | grep -v "^Reading" || true

# Download Ignition installer
cd /tmp
echo ''
echo '⬇️  Downloading Ignition installer...'
echo '   This may take a few minutes (200MB+)'
echo ''

# Try multiple download sources
if [ ! -f "ignition-installer.run" ]; then
    # Try GitHub Release first (if available)
    echo "Trying GitHub Release..."
    wget -q -O ignition-installer.run \
        https://github.com/teslasolar/ignition-sandbox/releases/download/v1.0-ignition/Ignition-linux-x64-installer.run 2>/dev/null || \
    # Fallback: Try InductiveAutomation directly (may fail with 403)
    ( echo "GitHub Release not found, trying Inductive Automation..." && \
      wget -O ignition-installer.run \
        https://files.inductiveautomation.com/release/ia/8.1.43/Ignition-8.1.43-linux-x64-installer.run 2>&1 ) || \
    # If both fail, show error
    ( echo "" && \
      echo "❌ Download failed!" && \
      echo "" && \
      echo "Please download manually:" && \
      echo "1. Visit: https://inductiveautomation.com/downloads/ignition/" && \
      echo "2. Download Linux x64 installer" && \
      echo "3. Upload to GitHub Release: v1.0-ignition" && \
      echo "" && \
      exit 1 )
fi

# Make installer executable and run unattended install
echo ''
echo '🔧 Running installer...'
chmod +x ignition-installer.run
./ignition-installer.run --unattendedmodeui none --mode unattended --prefix /opt/ignition

# Create data directory and configuration
mkdir -p /opt/ignition/data

# Configure gateway settings
cat > /opt/ignition/data/ignition.conf << 'EOF'
gateway.publicAddress.autoDetect=true
gateway.useSSL=false
gateway.http.port=8088
gateway.https.port=8043
EOF

# Start Ignition Gateway
echo ''
echo '🚀 Starting Ignition Gateway...'
/opt/ignition/ignition.sh start

echo ''
echo '================================================'
echo '✅ Ignition Gateway Ready!'
echo '================================================'
echo ''
echo '🌐 Access at: http://localhost:8088'
echo '🔑 Default credentials: admin/password'
echo ''
echo 'Open a browser inside WebVM and navigate to localhost:8088'
echo ''
