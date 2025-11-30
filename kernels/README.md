# Custom Kernels

x86 assembly bootloaders for Konomi IgnAIte v86.

## Kernels
- `minimal.asm` - 512-byte boot sector
- `ignition.asm` - Ignition gateway focused
- `full.asm` - Complete OS with shell

## Build
```bash
nasm -f bin minimal.asm -o minimal.bin
```

## Load in VM
```javascript
const kernel = await loadKernel('ignition');
vm.boot(kernel);
```

## Format
Standard x86 real mode, org 0x7C00.
