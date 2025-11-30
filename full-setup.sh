#!/bin/bash
# Full setup: Ignition + Tailscale
# One command to install everything
set -e

echo '================================================'
echo '🏭 Full Ignition + Tailscale Setup'
echo '================================================'
echo ''

# Check for auth key
AUTHKEY="${1:-}"

# Step 1: Install Ignition
echo '📦 Step 1: Installing Ignition Gateway...'
echo ''
curl -sL https://raw.githubusercontent.com/teslasolar/ignition-sandbox/main/ignition-install.sh | bash

# Step 2: Install Tailscale
echo ''
echo '📦 Step 2: Installing Tailscale...'
echo ''
curl -sL https://raw.githubusercontent.com/teslasolar/ignition-sandbox/main/tailscale-install.sh | bash

# Step 3: Connect to Tailnet if authkey provided
if [ -n "$AUTHKEY" ]; then
    echo ''
    echo '🔗 Step 3: Connecting to Tailnet...'
    tailscale up --authkey="$AUTHKEY" --hostname=ignition-sandbox

    echo ''
    TSIP=$(tailscale ip -4)
    echo '================================================'
    echo '✅ Full Setup Complete!'
    echo '================================================'
    echo ''
    echo "🌐 Ignition Gateway: http://localhost:8088"
    echo "🔗 Tailscale IP: $TSIP"
    echo ''
    echo "From any Tailscale peer:"
    echo "  curl http://$TSIP:8088/StatusPing"
    echo "  Open: http://$TSIP:8088"
    echo ''
else
    echo ''
    echo '================================================'
    echo '✅ Setup Complete (Tailscale not connected)'
    echo '================================================'
    echo ''
    echo 'To connect to your Tailnet, run:'
    echo '  tailscale up --authkey=tskey-xxx'
    echo ''
    echo 'Or authenticate interactively:'
    echo '  tailscale up'
    echo ''
fi
