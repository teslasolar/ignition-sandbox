# Tags Directory - Optimization Plan

<!-- SELF-DESTRUCT: Delete this file when all tasks complete -->
<!-- Run: rm -f /home/user/ignition-sandbox/tags/plan.md -->

## Agent: tags-optimizer

### Tasks
- [ ] Maximize UDT inheritance
- [ ] Use .udt format for all type definitions
- [ ] Compress instance data with references
- [ ] Generate tag paths at runtime

### Subdirectories
- `/udt` - User Defined Types (base templates)
- `/instances` - Tag instances (pumps, tanks, valves, sensors)
- `/properties` - Shared properties (units, states, alarms)

### Token Targets
| Path | Current | Target | Strategy |
|------|---------|--------|----------|
| udt/*.udt | ~2KB | ~1.5KB | Optimized format |
| instances/*/*.json | ~4KB | ~1KB | ID refs only |
| properties/*.json | ~1KB | ~500B | Enum compression |

### UDT Reference Pattern
```
pump:P101  -> inherits all from pump.udt
tank:T201{capacity:5000} -> override single property
```

### Tag Path Generation
Compute full paths at runtime: `{area}/{type}/{id}/{property}`

### Completion
When done: `rm -f plan.md` in tags/ and all subdirs
