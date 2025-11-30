# Konomi IgnAIte - Master Optimization Plan

<!-- SELF-DESTRUCT INSTRUCTIONS
When ALL tasks in this plan are complete:
1. Verify all subdirectory plan.md files have been deleted
2. Run: rm -f plan.md from each directory
3. Commit with message: "Clean: Remove completed plan.md files"
4. This file should be the LAST plan.md deleted
-->

## Project Overview
Browser-based Ignition sandbox with custom OS, virtual gateway, and PLC emulation.

## Directory Structure & Agent Assignments

| Directory | Agent Focus | Priority |
|-----------|-------------|----------|
| `/` | Master coordination, index optimization | HIGH |
| `/cli` | Command token reduction, wrapper efficiency | MEDIUM |
| `/commands` | CSV-first strategy, minimal JSON | HIGH |
| `/kernels` | ASM optimization, binary size | LOW |
| `/plc` | L5K compiler, virtual PLC runtime | HIGH |
| `/screens` | Component deduplication, template reuse | MEDIUM |
| `/scripts` | Function consolidation | LOW |
| `/tags` | UDT compression, instance inheritance | HIGH |
| `/templates` | JSON minification, shared schemas | MEDIUM |
| `/vm` | Boot optimization, memory efficiency | MEDIUM |

## Token Optimization Strategies

### 1. JSON Compression (All Directories)
- Remove whitespace in production JSON
- Use abbreviated keys: `n`=name, `t`=type, `v`=value, `d`=description
- Reference by ID instead of inline objects
- Use `index.json` manifests with `$ref` patterns

### 2. CSV-First Data (commands/, tags/)
- Store tabular data as CSV, not JSON arrays
- Parse at runtime with minimal overhead
- Reduce tokens by ~60% for list data

### 3. Template Inheritance (screens/, tags/)
- Define base templates once
- Use `$extends` pattern for variations
- Compute derived values at runtime

### 4. Code Deduplication
- Shared utility functions in `/scripts/common.js`
- Single-source component definitions
- Generate variations from templates

## New: PLC Directory Structure

```
/plc
├── plan.md           # PLC-specific optimization
├── index.json        # PLC manifest
├── compiler/         # L5K compiler
│   ├── lexer.js      # Tokenize L5K
│   ├── parser.js     # Parse to AST
│   └── codegen.js    # Generate runtime
├── runtime/          # Virtual PLC
│   ├── cpu.js        # Ladder logic executor
│   ├── io.js         # I/O simulation
│   └── memory.js     # Data tables
├── programs/         # Sample L5K files
│   ├── starter.l5k   # Basic program
│   └── process.l5k   # Process control
└── gateway-bridge.js # Connect to virtual gateway
```

## Completion Checklist

- [ ] All subdirectory plan.md created
- [ ] Token optimization applied to each dir
- [ ] PLC directory created with L5K support
- [ ] Virtual gateway integration complete
- [ ] All plan.md files self-destructed
- [ ] Final commit pushed

## Agent Coordination

Each subdirectory agent should:
1. Read local plan.md
2. Execute optimization tasks
3. Update index.json with optimized structure
4. Delete plan.md when complete
5. Report completion to parent

---
*Auto-generated plan. Delete when all tasks complete.*
