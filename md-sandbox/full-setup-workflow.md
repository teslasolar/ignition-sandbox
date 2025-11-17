---
uuid: a3d5f891-2c4e-4b6a-8f12-9e4c7d3a1b2f
title: Complete Ignition Sandbox Workflow
tags: [workflow, automation, complete]
---

# Complete Setup Workflow

Automated workflow for full Ignition sandbox deployment.

## Workflow Steps

### 1. Install Ignition Gateway
> 550e8400-e29b-41d4-a716-446655440000 bash

### 2. Wait for startup
```bash
sleep 10
echo "Waiting for Ignition to initialize..."
```

### 3. Configure Tags
> 7c9e6679-7425-40de-944b-e07fc1f90ae7 python

### 4. Verify Installation
```bash
curl -s http://localhost:8088/StatusPing
echo ""
echo "✅ Workflow complete!"
```

## Referenced Files

Installation script:
@ 550e8400-e29b-41d4-a716-446655440000

Tag configuration:
@ 7c9e6679-7425-40de-944b-e07fc1f90ae7

## Execute Full Workflow

```bash
uuid-resolve proc full-setup-workflow.md | bash
```

This processes all `>` prompts and executes sequentially.
