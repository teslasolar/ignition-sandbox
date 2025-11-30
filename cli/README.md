# CLI Tools

Command-line framework for Konomi IgnAIte.

## Usage
```bash
./sandbox-cli ping        # Health check
./sandbox-cli sync        # Check repo→pages
./sandbox-cli watch       # Watch for sync
./sandbox-cli commands    # List commands
./sandbox-cli mcp list    # MCP tools
```

## Structure
- `commands/` - JSON/CSV definitions
- `wrappers/` - API/MCP wrappers

## Auto-Load Formats
JSON, Markdown (YAML front matter), CSV.

## MCP Tools
`sandbox_ping`, `sandbox_fetch`, `sandbox_sync_check`, `sandbox_status`
