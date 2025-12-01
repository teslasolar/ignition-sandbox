# Ignition Sandbox

Browser-based Ignition SCADA development environment with full VM capabilities and Linux distributions.

## Live Demo

**Access the sandbox at: https://teslasolar.github.io/ignition-sandbox/**

## Quick Start

### Browser VM (Recommended)
1. Visit the [live sandbox](https://teslasolar.github.io/ignition-sandbox/)
2. Choose "Ignition Sandbox" for instant boot
3. Run `ignition install` in the terminal
4. Access Gateway at http://localhost:8088

### Direct Linux Installation

```bash
# Install Ignition Gateway
curl -sL https://raw.githubusercontent.com/teslasolar/ignition-sandbox/main/ignition-install.sh | sudo bash

# Install Tailscale for remote access
curl -sL https://raw.githubusercontent.com/teslasolar/ignition-sandbox/main/tailscale-install.sh | bash
```

## Features

### Browser-Based VM Environment
- **v86 x86 Emulator** - Full x86 emulation in JavaScript/WebAssembly
- **Multiple Linux Distros** - Alpine, Tiny Core, and SliTaz Linux ready to boot
- **Real Boot Sectors** - Custom 512-byte boot sectors for minimal testing
- **Instant Simulation** - JavaScript-based Linux environment for quick access

### Ignition Integration
- **Gateway Installation** - Full Ignition Gateway support in browser
- **PLC Simulation** - Allen-Bradley CompactLogix simulation
- **HMI Designer** - Drag-and-drop interface builder
- **Tag Database** - Real-time tag monitoring and control

### Development Tools
- Custom xterm.js terminal interface
- Command manifest system (JSON-defined commands)
- CLI tools for testing and automation
- Tailscale integration for remote access
- No external VM dependencies

## Available Linux Distributions

### In Browser VM
- **Alpine Linux 3.19** (46MB) - Security-focused, lightweight distribution
- **Tiny Core Linux 15.0** (24MB) - Minimal Linux, perfect for testing
- **SliTaz Rolling** (55MB) - Full-featured lightweight Linux
- **Custom Boot Sectors** - Minimal boot, interactive shell, gateway display

## Project Structure

```
ignition-sandbox/
├── index.html              # Main browser OS interface
├── vm/                     # Virtual machine environment
│   ├── index.html          # VM launcher interface
│   ├── images/             # OS images and boot sectors
│   │   ├── linux/          # Linux ISO distributions
│   │   ├── kernels/        # Custom boot sectors
│   │   └── seabios/        # BIOS and VGA ROM
│   └── lib/                # v86 emulator libraries
├── commands/               # Command manifest system
├── scripts/                # Installation scripts
├── cli/                    # Python CLI tools
├── plc/                    # PLC simulation files
├── screens/                # HMI screen templates
└── tags/                   # Tag database definitions
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
