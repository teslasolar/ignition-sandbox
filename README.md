# Ignition Browser Sandbox

Full Ignition SCADA running in your browser via WebAssembly

## Quick Start

1. Visit: https://teslasolar.github.io/ignition-sandbox
2. Wait for custom WebVM to load (first time: 1-2 min, cached: instant)
3. Ignition auto-starts on boot
4. Access at `localhost:8088` inside VM
5. Login: admin/password

## Deployment

See [DEPLOY.md](DEPLOY.md) for complete deployment instructions including:
- Building custom WebVM images
- GitHub Actions automation
- Manual deployment steps

## How It Works

- **Custom Docker Image**: Pre-built with Ignition installed
- **WebVM**: Runs Debian Linux in browser via WebAssembly
- **GitHub Container Registry**: Hosts the custom image
- **Auto-start**: Ignition launches automatically on boot
- **All client-side**: No server required, runs entirely in browser

## Features

- Full Designer access
- Tag provider
- Perspective/Vision modules
- Scripting console
- Persistent via IndexedDB

## Tech Stack

- WebVM: https://webvm.io
- Ignition: https://inductiveautomation.com
- Host: GitHub Pages

## Size

- Initial load: ~50MB
- Full VM: ~800MB (streamed)
- Boot time: 30-60s

## License

Ignition: Trial mode (2hr reset)
WebVM: Apache 2.0
