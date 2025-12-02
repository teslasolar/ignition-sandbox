# Ignition Sandbox VM

Browser-based x86 virtual machine emulator using v86.

## Launch
Open `/vm/` and select a distribution:
- **Alpine Linux** - 46MB, ~30s boot (recommended)
- **TinyCore Linux** - 24MB, ~20s boot (minimal)
- **SliTaz Linux** - 55MB, ~40s boot (full)

## Views
Access different views via URL parameters:
- **Main VM**: `/vm/` or `/vm/?view=main`
- **Error Monitor**: `/vm/?view=monitor`
- **API Interface**: `/vm/?view=api`
- **Health Check**: `/vm/?view=health`

## Commands
```bash
# System
uname -a           # System info
free -h            # Memory usage
ps aux             # Process list
df -h              # Disk usage

# Network
ifconfig           # Network config
ping 10.0.2.2      # Test gateway

# Ignition
ignition status    # Gateway status
ignition install   # Install gateway
```

## Structure
- `index.html` - Unified view loader
- `error-monitor.js` - Alarm system with tags
- `screens/vm/*.json` - View configurations
- `images/linux/` - Linux ISO files
- `images/seabios/` - BIOS files
- `lib/` - V86 loader scripts

## API
PostMessage API for VM control:
```javascript
// Send command
window.postMessage({
  type: 'vm-command',
  action: 'boot',
  params: { distro: 'alpine' }
}, '*');
```

## Error Alarms
- `🚨 [V86_LOAD_FAIL]` - Emulator failed
- `🚨 [BIOS_MISSING]` - BIOS not found
- `⚠️ [CDN_SLOW]` - Slow loading
- `⚠️ [ISO_NOT_FOUND]` - ISO missing
