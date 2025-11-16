# Ignition Browser Sandbox

Full Ignition SCADA running in your browser via WebAssembly

## Quick Start

1. Visit: https://YOUR_USERNAME.github.io/ignition-sandbox
2. Wait 30-60s for VM boot
3. Access at `localhost:8088` inside VM
4. Login: admin/password

## How It Works

- WebVM (Debian Linux in WASM)
- Java 11 JRE
- Ignition Gateway 8.1.43
- All client-side, no server

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
