---
uuid: f8a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c
title: UUID Markdown Sandbox README
---

# UUID Markdown Sandbox

Web-based markdown executor with UUID file refs. Files identified by UUID, not paths. Single-char prompts for execution.

## Quick Start

```bash
# List all files
uuid-resolve list

# Get file path
uuid-resolve path 550e8400-e29b-41d4-a716-446655440000

# Read content
uuid-resolve read 550e8400-e29b-41d4-a716-446655440000

# Execute code blocks
uuid-resolve exec 550e8400-e29b-41d4-a716-446655440000 bash

# Process prompts
uuid-resolve proc workflow.md
```

## File Format

```markdown
---
uuid: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
title: Your Title
tags: [tag1, tag2]
---

# Content

\`\`\`bash
echo "code here"
\`\`\`
```

## Single-Char Prompts

| Char | Action | Example |
|------|--------|---------|
| `>` | Execute code | `> uuid bash` |
| `@` | Reference content | `@ uuid` |
| `#` | Include code only | `# uuid python` |

## Example Workflow

```markdown
# Setup Ignition
> 550e8400-e29b-41d4-a716-446655440000

# Configure tags
> 7c9e6679-7425-40de-944b-e07fc1f90ae7 python

# Reference setup docs
@ 550e8400-e29b-41d4-a716-446655440000
```

## Available Files

- `550e8400...` - Ignition setup script
- `7c9e6679...` - Tag configuration
- `a3d5f891...` - Full workflow
- `f8a1b2c3...` - This README

## Features

- UUID-based file identification
- Auto-path resolution
- Embedded code execution
- Cross-file references
- Workflow composition
- Language-agnostic

## Integration

Add to `.bashrc`:
```bash
alias uu='uuid-resolve'
alias uul='uuid-resolve list'
alias uup='uuid-resolve proc'
```

Usage:
```bash
uu list
uu exec 550e8400-e29b-41d4-a716-446655440000
uup my-workflow.md | bash
```

---

Under 250 tokens when compressed. UUID system enables portable, path-independent workflows.
