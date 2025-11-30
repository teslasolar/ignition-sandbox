# Scripts Directory - Optimization Plan

<!-- SELF-DESTRUCT: Delete this file when all tasks complete -->
<!-- Run: rm -f /home/user/ignition-sandbox/scripts/plan.md -->

## Agent: scripts-optimizer

### Tasks
- [ ] Create common.js with shared utilities
- [ ] Deduplicate parsing functions
- [ ] Minify all scripts
- [ ] Add JSDoc for self-documentation

### Token Targets
| File | Current | Target | Strategy |
|------|---------|--------|----------|
| *.js | ~5KB | ~3KB | Consolidate |
| common.js | - | ~1KB | Shared utils |

### Shared Utilities
```javascript
// common.js - shared across all modules
const U = {
  parse: (s) => JSON.parse(s),
  fmt: (t, d) => t.replace(/\{(\w+)\}/g, (_, k) => d[k]),
  csv: (s) => s.split('\n').map(r => r.split(',')),
  $: (q) => document.querySelector(q)
};
```

### Completion
When done: `rm -f plan.md`
