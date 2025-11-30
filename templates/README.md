# Templates

JSON templates for Konomi IgnAIte OS.

## Structure
```
templates/
├── commands/     # Tab command definitions
│   ├── ignition.json
│   ├── tailscale.json
│   ├── system.json
│   └── setup.json
├── tabs/         # Custom tab content
│   ├── designer.json
│   └── vm.json
└── manifest.json # Root config
```

## Format
Compact JSON, one object per line:
```json
{"id":"x","label":"X","code":"cmd"}
```
