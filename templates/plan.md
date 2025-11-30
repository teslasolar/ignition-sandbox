# Templates Directory - Optimization Plan

<!-- SELF-DESTRUCT: Delete this file when all tasks complete -->
<!-- Run: rm -f /home/user/ignition-sandbox/templates/plan.md -->

## Agent: templates-optimizer

### Tasks
- [ ] Minify all JSON files
- [ ] Create shared schema definitions
- [ ] Remove duplicate command structures
- [ ] Consolidate tab definitions

### Subdirectories
- `/commands` - Command templates (ignition, tailscale, system, setup)
- `/tabs` - Tab definitions (designer, vm)
- `/views` - View templates

### Token Targets
| Path | Current | Target | Strategy |
|------|---------|--------|----------|
| commands/*.json | ~4KB | ~2KB | Shared schema |
| tabs/*.json | ~1KB | ~500B | Minify |
| manifest.json | ~500B | ~200B | Refs only |

### Schema Pattern
```json
{"$schema":"cmd","items":[["id","label","cmd"],...]}
```

### Completion
When done: `rm -f plan.md` in templates/ and subdirs
