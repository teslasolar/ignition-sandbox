# Kernels Directory - Optimization Plan

<!-- SELF-DESTRUCT: Delete this file when all tasks complete -->
<!-- Run: rm -f /home/user/ignition-sandbox/kernels/plan.md -->

## Agent: kernels-optimizer

### Tasks
- [ ] Optimize ASM for smaller binary output
- [ ] Share common routines across kernels
- [ ] Add kernel metadata to single manifest
- [ ] Pre-compile binaries for faster boot

### Token Targets
| File | Current | Target | Strategy |
|------|---------|--------|----------|
| *.asm | ~8KB | ~6KB | Shared macros |
| kernel-loader.js | ~3KB | ~2KB | Minify assembler |
| index.html | ~2KB | ~1.5KB | Inline critical CSS |

### Boot Optimization
- Precompute boot sector signatures
- Cache assembled kernels in localStorage
- Lazy-load full.asm (largest kernel)

### Completion
When done: `rm -f plan.md` and verify all kernels boot
