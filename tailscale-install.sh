#!/bin/bash
# Tailscale installer for Linux
# Run: curl -sL https://raw.githubusercontent.com/teslasolar/ignition-sandbox/main/tailscale-install.sh | bash
set -e

echo '================================================'
echo '🔗 Installing Tailscale...'
echo '================================================'
echo ''

# Check if Debian-based
if [ ! -f /etc/debian_version ]; then
    echo "⚠️  This script is designed for Debian/Ubuntu"
    echo "For other distros, visit: https://tailscale.com/download"
    exit 1
fi

# Install Tailscale
echo '📦 Adding Tailscale repository...'
curl -fsSL https://pkgs.tailscale.com/stable/debian/bullseye.noarmor.gpg | apt-key add - 2>/dev/null || true
curl -fsSL https://pkgs.tailscale.com/stable/debian/bullseye.tailscale-keyring.list | tee /etc/apt/sources.list.d/tailscale.list

echo '📦 Installing Tailscale...'
apt-get update -qq
apt-get install -y tailscale

echo ''
echo '🚀 Starting Tailscale daemon...'
tailscaled --state=/var/lib/tailscale/tailscaled.state &
sleep 2

echo ''
echo '================================================'
echo '✅ Tailscale Installed!'
echo '================================================'
echo ''
echo 'Next steps:'
echo ''
echo '1. Authenticate with your Tailnet:'
echo '   tailscale up --authkey=tskey-xxx'
echo ''
echo '   Or interactive login:'
echo '   tailscale up'
echo ''
echo '2. Check status:'
echo '   tailscale status'
echo ''
echo '3. Get your Tailscale IP:'
echo '   tailscale ip'
echo ''
echo '4. From any Tailscale peer, access Ignition:'
echo '   curl http://<tailscale-ip>:8088/StatusPing'
echo ''
