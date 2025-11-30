# Commands Directory - Optimization Plan

<!-- SELF-DESTRUCT: Delete this file when all tasks complete -->
<!-- Run: rm -f /home/user/ignition-sandbox/commands/plan.md -->

## Agent: commands-optimizer

### Tasks
- [ ] Convert all command arrays to commands.csv
- [ ] Remove manifest.json redundancy
- [ ] Use single-line command format: `id,name,cmd,desc`
- [ ] Generate runtime objects from CSV

### Token Targets
| File | Current | Target | Strategy |
|------|---------|--------|----------|
| manifest.json | ~1KB | ~200B | CSV reference only |
| *.json arrays | ~3KB | 0B | Delete, use CSV |
| commands.csv | - | ~1KB | Primary data source |

### Completion
When done: `rm -f plan.md` and verify commands.csv works
