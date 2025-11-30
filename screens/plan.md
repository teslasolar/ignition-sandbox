# Screens Directory - Optimization Plan

<!-- SELF-DESTRUCT: Delete this file when all tasks complete -->
<!-- Run: rm -f /home/user/ignition-sandbox/screens/plan.md -->

## Agent: screens-optimizer

### Tasks
- [ ] Deduplicate component definitions
- [ ] Create base component schema
- [ ] Use $ref for shared properties
- [ ] Consolidate CSS into single theme file

### Subdirectories
- `/components` - Shared UI components
- `/designer` - Perspective designer mock
- `/sandbox` - Live preview area
- `/templates` - Reusable screen templates

### Token Targets
| Path | Current | Target | Strategy |
|------|---------|--------|----------|
| templates/components/*.json | ~4KB | ~2KB | Base + extends |
| templates/symbols/*.json | ~2KB | ~1KB | Shared paths |
| templates/views/*.json | ~3KB | ~1.5KB | Component refs |

### Component Inheritance
```json
{"$base":"pump","overrides":{"color":"blue"}}
```

### Completion
When done: `rm -f plan.md` in screens/ and all subdirs
