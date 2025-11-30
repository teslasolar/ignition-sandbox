# CLI Directory - Optimization Plan

<!-- SELF-DESTRUCT: Delete this file when all tasks complete -->
<!-- Run: rm -f /home/user/ignition-sandbox/cli/plan.md -->

## Agent: cli-optimizer

### Tasks
- [ ] Consolidate command definitions into single CSV
- [ ] Reduce wrapper JSON to minimal schema
- [ ] Share common options across commands
- [ ] Generate help text from CSV at runtime

### Token Targets
| File | Current | Target | Strategy |
|------|---------|--------|----------|
| commands/*.json | ~2KB | ~500B | CSV conversion |
| wrappers/*.json | ~1KB | ~300B | Schema refs |
| index.json | ~500B | ~200B | Minify |

### Completion
When done: `rm -f plan.md` and update parent index.json
