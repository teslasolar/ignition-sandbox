# VM Sandbox

Browser-based Linux via v86-lite emulator.

## Launch
Open `/vm/` and select an image:
- **Buildroot** - 15MB, ~5s boot (minimal)
- **Alpine** - 50MB, ~15s boot (recommended)
- **Arch** - 60MB, ~20s boot (full)

## Commands
```bash
ignition status    # Gateway status
ignition install   # Install gateway
ignition start     # Start gateway
uname -a           # System info
ifconfig           # Network config
```

## Structure
- `lib/v86-lite.js` - Custom x86 emulator
- `boot/config.json` - VM configuration
- `terminal.html` - Standalone terminal
