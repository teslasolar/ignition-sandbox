---
uuid: 7c9e6679-7425-40de-944b-e07fc1f90ae7
title: Ignition Tag Configuration
tags: [ignition, tags, plc]
---

# Tag Configuration

Python script to auto-create Ignition tags via Gateway API.

## Create Tags Script

```python
import requests
import json

GATEWAY = "http://localhost:8088"
AUTH = ("admin", "password")

def create_tag_provider(name="default"):
    """Create tag provider"""
    url = f"{GATEWAY}/data/tag-config"
    payload = {
        "name": name,
        "type": "memory"
    }
    r = requests.post(url, json=payload, auth=AUTH)
    return r.status_code == 200

def create_tags(provider="default", tags=[]):
    """Create multiple tags"""
    url = f"{GATEWAY}/data/tag-config/{provider}/tags"
    for tag in tags:
        requests.post(url, json=tag, auth=AUTH)
    print(f"✅ Created {len(tags)} tags")

# Example usage
if __name__ == "__main__":
    tags = [
        {"name": "Temperature", "dataType": "Float", "value": 72.5},
        {"name": "Pressure", "dataType": "Int", "value": 14},
        {"name": "Running", "dataType": "Boolean", "value": True},
    ]
    create_tags(tags=tags)
```

## Run It

> 550e8400-e29b-41d4-a716-446655440000

After Ignition is running, execute this tag config.

