# Assets Directory - Optimization Plan

<!-- SELF-DESTRUCT: Delete this file when all tasks complete -->
<!-- Run: rm -f /home/user/ignition-sandbox/assets/plan.md -->

## Agent: assets-optimizer

### Tasks
- [ ] Optimize SVG icons (remove metadata)
- [ ] Inline critical icons as data URIs
- [ ] Create icon sprite sheet
- [ ] Compress any images

### Token Targets
| Type | Strategy |
|------|----------|
| SVG | SVGO optimization, remove comments |
| PNG | Convert to WebP where possible |
| CSS | Inline critical, lazy-load rest |

### Icon Sprite Pattern
```css
.icon { background: url('sprites.svg'); }
.icon-cpu { background-position: 0 0; }
.icon-tag { background-position: -24px 0; }
```

### Completion
When done: `rm -f plan.md`
