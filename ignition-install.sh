#!/bin/bash
set -e

echo '🔧 Installing Ignition Gateway...'

# Update package list and install dependencies
apt-get update -qq
apt-get install -y wget openjdk-11-jre-headless unzip curl

# Download Ignition installer
cd /tmp
wget -q https://files.inductiveautomation.com/release/ia/8.1.43/Ignition-8.1.43-linux-x64-installer.run

# Make installer executable and run unattended install
chmod +x Ignition*.run
./Ignition*.run --unattendedmodeui none --mode unattended --prefix /opt/ignition

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
/opt/ignition/ignition.sh start

echo '✅ Ignition running on http://localhost:8088'
echo 'Default credentials: admin/password'
