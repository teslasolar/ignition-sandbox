# Ignition Sandbox

Custom Linux sandbox for Ignition SCADA testing via GitHub Pages.

## Quick Start

Visit: https://teslasolar.github.io/ignition-sandbox

Or run directly in any Linux terminal:

```bash
# Install Ignition Gateway
curl -sL https://raw.githubusercontent.com/teslasolar/ignition-sandbox/main/ignition-install.sh | sudo bash

# Install Tailscale for remote access
curl -sL https://raw.githubusercontent.com/teslasolar/ignition-sandbox/main/tailscale-install.sh | bash
```

## Features

- Custom xterm.js terminal interface
- Command manifest system (JSON-defined commands)
- CLI tools for testing and automation
- Tailscale integration for remote access
- No external VM dependencies

## Structure

```
ignition-sandbox/
├── index.html              # Terminal UI
├── commands/
│   └── manifest.json       # Command definitions
├── scripts/
│   ├── sandbox             # CLI for Linux
│   └── install-cli         # CLI installer
├── cli/                    # Python CLI tools
│   ├── sandbox-cli         # Main CLI
│   └── wrappers/           # API/MCP wrappers
└── *.sh                    # Install scripts
```

## CLI Usage

```bash
# Install sandbox CLI
curl -sL https://raw.githubusercontent.com/teslasolar/ignition-sandbox/main/scripts/install-cli | bash

# Commands
sandbox install     # Install Ignition
sandbox tailscale   # Install Tailscale
sandbox status      # Check status
sandbox start       # Start gateway
sandbox stop        # Stop gateway
```

## Python CLI

```bash
./cli/sandbox-cli ping      # Check Pages status
./cli/sandbox-cli sync      # Check repo→pages sync
./cli/sandbox-cli commands  # List commands
./cli/sandbox-cli ts status # Tailscale status
```

## License

MIT
