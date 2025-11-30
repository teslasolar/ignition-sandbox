---
name: test-sync
description: Test repo to GitHub Pages sync timing
type: sync
files: index.html,ignition-install.sh
interval: 5
max_wait: 120
---

# Sync Test Command

This command monitors the synchronization between the local repository
and the deployed GitHub Pages site.

## Usage

```bash
sandbox-cli run test-sync
```

## What it checks

1. Computes MD5 hash of local file
2. Fetches same file from GitHub Pages
3. Compares hashes to detect sync status
4. Reports timing when sync completes

## Expected Sync Times

- GitHub Actions deploy: 30-60 seconds
- Pages CDN propagation: 5-30 seconds
- Total: ~1-2 minutes typically
