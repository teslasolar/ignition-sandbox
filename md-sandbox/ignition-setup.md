---
uuid: 550e8400-e29b-41d4-a716-446655440000
title: Ignition Gateway Setup Script
tags: [ignition, setup, automation]
---

# Ignition Gateway Setup

Auto-install Ignition Gateway on WebVM with zero config.

## Installation Script

```bash
#!/bin/bash
set -e

echo "🏭 Ignition Gateway Quick Setup"
echo "================================"

# Check if already installed
if [ -d "/opt/ignition" ]; then
    echo "✅ Ignition already installed"
    /opt/ignition/ignition.sh status
    exit 0
fi

# Install Java
apt-get update -qq
apt-get install -y openjdk-11-jre-headless wget

# Download Ignition (placeholder - update with real URL)
cd /tmp
echo "⬇️  Downloading Ignition..."
wget -q -O ignition.run \
    https://files.inductiveautomation.com/release/ia/8.1.43/Ignition-linux-x64.run || \
    echo "⚠️  Download URL needs updating"

# Install
chmod +x ignition.run
./ignition.run --unattended --prefix /opt/ignition

# Start
/opt/ignition/ignition.sh start

echo "✅ Ready at http://localhost:8088"
echo "🔑 Login: admin / password"
```

## Quick Start

```bash
# Run this script
curl -sL https://raw.githubusercontent.com/teslasolar/ignition-sandbox/main/md-sandbox/ignition-setup.md | bash
```

## Configuration

Default settings:
- Port: 8088
- HTTPS: Disabled
- Auto-start: Enabled
