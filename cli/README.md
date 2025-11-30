# Ignition Sandbox CLI

Command-line interface for testing and monitoring the GitHub Pages sandbox.

## Quick Start

```bash
# Check if Pages is up
./cli/sandbox-cli ping

# Get full status
./cli/sandbox-cli status

# Check sync between repo and deployed pages
./cli/sandbox-cli sync

# Watch for sync after push
./cli/sandbox-cli watch
```

## Commands

| Command | Description |
|---------|-------------|
| `ping` | Health check - verify Pages responds |
| `fetch <path>` | Fetch specific file, show status/hash |
| `sync [file]` | Check if local matches deployed |
| `watch [file]` | Watch and wait for sync to complete |
| `commands` | List loaded command definitions |
| `run <name>` | Execute a loaded command |
| `mcp list` | List available MCP tools |
| `mcp call <tool> [json]` | Call MCP tool with params |
| `status` | Full status report |

## Auto-Loading Commands

Drop files in `cli/commands/` - they're auto-loaded by format:

### JSON (single or array)
```json
{
  "name": "my-check",
  "description": "Check something",
  "type": "fetch",
  "path": "index.html"
}
```

### Markdown (with YAML front matter)
```markdown
---
name: my-test
description: Run a test
type: sync
---

# My Test

Content and code blocks here...
```

### CSV (batch commands)
```csv
name,description,type,url
check-1,First check,fetch,/index.html
check-2,Second check,fetch,/script.js
```

## MCP Integration

The CLI exposes MCP-compatible tools for external integration:

```bash
# List available tools
./cli/sandbox-cli mcp list

# Export schema
./cli/sandbox-cli mcp schema

# Call a tool
./cli/sandbox-cli mcp call sandbox_ping
./cli/sandbox-cli mcp call sandbox_fetch '{"path": "index.html"}'
```

### Available MCP Tools

- `sandbox_ping` - Quick health check
- `sandbox_fetch` - Fetch file with status/hash
- `sandbox_sync_check` - Compare local vs deployed
- `sandbox_run_command` - Execute loaded command
- `sandbox_list_commands` - List available commands
- `sandbox_status` - Full status report

## Sync Monitoring

After pushing changes, watch for Pages deployment:

```bash
# Push your changes
git push origin main

# Watch for sync (checks every 5s, max 5 min)
./cli/sandbox-cli watch index.html

# Output:
# Watching index.html for sync (local: a1b2c3d4)...
#   Check 1: remote=pending...
#   Check 2: remote=a1b2c3d4
# {"synced": true, "elapsed_sec": 35, "checks": 2}
```

## JSON Output

Add `-j` for JSON output (useful for piping):

```bash
./cli/sandbox-cli ping -j | jq .status
./cli/sandbox-cli sync -j | jq .synced
```

## API Wrapper (Python)

For programmatic use:

```python
from cli.wrappers.api_wrapper import SandboxAPI

api = SandboxAPI()
result = api.ping()
print(f"Status: {result['status']}")
```
