# VM Directory - Optimization Plan

<!-- SELF-DESTRUCT: Delete this file when all tasks complete -->
<!-- Run: rm -f /home/user/ignition-sandbox/vm/plan.md -->

## Agent: vm-optimizer

### Tasks
- [ ] Optimize v86-lite.js for size
- [ ] Minimize boot config
- [ ] Lazy-load VM components
- [ ] Add PLC bridge connection

### Subdirectories
- `/boot` - Boot configuration
- `/images` - Disk/kernel images
- `/lib` - VM libraries

### Token Targets
| Path | Current | Target | Strategy |
|------|---------|--------|----------|
| v86-lite.js | ~15KB | ~10KB | Tree-shake |
| boot/config.json | ~500B | ~200B | Minify |
| index.html | ~3KB | ~2KB | Inline critical |

### PLC Integration
```javascript
// Bridge VM to virtual PLC
vm.on('io', (port, value) => plc.handleIO(port, value));
plc.on('output', (addr, value) => vm.setMemory(addr, value));
```

### Memory Optimization
- Use SharedArrayBuffer for VM memory
- Lazy-load boot images
- Cache compiled kernels

### Completion
When done: `rm -f plan.md` in vm/ and subdirs
