# UUID Markdown System - Quick Reference

Compact markdown executor with UUID file refs & single-char prompts. Files by UUID, not paths.

## Usage

```bash
uul                    # list all
uur <uuid>             # read file
uux <uuid> [lang]      # execute code
uup <file>             # process prompts
```

## File Format

```yaml
---
uuid: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
title: File Title
---

# Content
\`\`\`bash
code here
\`\`\`
```

## Single-Char Prompts

| Char | Action | Example |
|------|--------|---------|
| `>` | Execute | `> 550e8400-e29b bash` |
| `@` | Reference | `@ 550e8400-e29b` |
| `#` | Include code | `# 550e8400-e29b python` |

## Example Workflow

```markdown
---
uuid: a3d5f891-2c4e-4b6a-8f12-9e4c7d3a1b2f
---

# Deploy Ignition

> 550e8400-e29b-41d4-a716-446655440000
> 7c9e6679-7425-40de-944b-e07fc1f90ae7 python
```

Run: `uup workflow.md | bash`

## Available Files

```
550e8400... | Ignition setup
7c9e6679... | Tag config
a3d5f891... | Full workflow
f8a1b2c3... | README
```

## Features

- UUID refs (portable)
- Auto-path lookup
- Cross-file execution
- Single-char syntax
- Language-agnostic
- <250 tokens compressed

---

*Markdown → Execution → No path dependencies*
