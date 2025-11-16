# Ignition Browser Sandbox

Full Ignition SCADA running in your browser via WebAssembly

## Quick Start

1. **Visit**: https://teslasolar.github.io/ignition-sandbox
2. **Copy** the install command from the sidebar (one-click)
3. **Paste** in the WebVM terminal (right-click or Ctrl+Shift+V)
4. **Wait** 3-5 minutes for installation
5. **Access** Ignition at `localhost:8088` inside VM browser
6. **Login**: admin/password

## Current Setup: Guided Installation

The sandbox uses a **side-by-side interface**:
- Left: Step-by-step instructions with one-click copy
- Right: Live WebVM terminal
- Installation happens once, persists via browser cache

## Future: Fully Automated (Optional)

See [DEPLOY.md](DEPLOY.md) for building a custom Docker image with Ignition pre-installed:
- Zero manual steps - Ignition auto-starts on boot
- Requires building and hosting custom WebVM image
- Uses GitHub Actions + Container Registry
- See `index-custom-image.html` for the automated version

## How It Works

- **WebVM**: Runs full Debian Linux in browser via WebAssembly
- **Installation Script**: Hosted on GitHub, fetched via curl
- **One-Time Setup**: Install command runs apt, downloads Ignition, configures gateway
- **Persistence**: IndexedDB caches the VM state across sessions
- **All Client-Side**: No server required, runs entirely in your browser

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
