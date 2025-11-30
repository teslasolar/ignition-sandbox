# Commands

Shell commands for Ignition sandbox.

## Files
- `commands.csv` - All commands (tabular)
- `manifest.json` - Metadata + categories
- `test-pages.json` - GitHub Pages tests

## CSV Format
```csv
name,category,description,run
start,ignition,Start Gateway,/opt/ignition/ignition.sh start
```

## Categories
- `ignition` - Gateway control
- `tailscale` - VPN commands
- `system` - System tools
- `setup` - Environment setup
