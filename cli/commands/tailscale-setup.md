---
name: tailscale-setup
description: Setup guide for connecting Ignition Sandbox via Tailscale
type: documentation
tags: [tailscale, networking, remote-access]
---

# Tailscale + Ignition Sandbox Setup

Access your WebVM-hosted Ignition Gateway from anywhere via Tailscale.

## Why Tailscale?

- **Secure**: End-to-end encrypted mesh VPN
- **No port forwarding**: Works through NATs/firewalls
- **Easy sharing**: Share with team via Tailnet or publicly via Funnel

## Setup Options

### Option 1: Access from Tailscale Peers (Serve)

Share your local Ignition with your Tailnet (private):

```bash
# In the WebVM terminal after Ignition starts
tailscale serve 8088

# Access from any Tailscale device:
# https://<webvm-hostname>.<tailnet>.ts.net
```

### Option 2: Public Access (Funnel)

Share publicly via HTTPS (no Tailscale needed for viewers):

```bash
# In the WebVM terminal
tailscale funnel 8088

# Anyone can access:
# https://<webvm-hostname>.<tailnet>.ts.net
```

### Option 3: Connect to Remote Ignition

If Ignition runs on another Tailscale machine:

```bash
# Get the peer's Tailscale IP
tailscale status

# Access directly
curl http://100.x.y.z:8088/StatusPing
```

## Testing Connection

```bash
# From CLI
./cli/wrappers/tailscale-wrapper.py status
./cli/wrappers/tailscale-wrapper.py peers
./cli/wrappers/tailscale-wrapper.py test

# Test specific peer
./cli/wrappers/tailscale-wrapper.py proxy 100.64.0.5
```

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Your Browser   │────▶│  GitHub Pages    │────▶│  WebVM (WASM)   │
│                 │     │  (Static Host)   │     │  + Ignition     │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                        ┌──────────────────┐              │ Tailscale
                        │  Tailscale       │◀─────────────┘
                        │  (Mesh VPN)      │
                        └────────┬─────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            ▼                    ▼                    ▼
    ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
    │  Phone/Tablet │   │  Other PC     │   │  Cloud Server │
    │  (Tailscale)  │   │  (Tailscale)  │   │  (Tailscale)  │
    └───────────────┘   └───────────────┘   └───────────────┘
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "tailscale not found" | Install: `curl -fsSL https://tailscale.com/install.sh \| sh` |
| "not connected" | Run: `tailscale up` |
| Funnel not working | Enable in admin console: https://login.tailscale.com/admin/dns |
| Can't reach peer | Check peer is online: `tailscale status` |
