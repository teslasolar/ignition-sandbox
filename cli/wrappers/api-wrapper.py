#!/usr/bin/env python3
"""
API Wrapper - Standalone HTTP client for sandbox testing
Can be imported or run directly
"""
import json
import time
import hashlib
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, List

PAGES_URL = "https://teslasolar.github.io/ignition-sandbox"
RAW_URL = "https://raw.githubusercontent.com/teslasolar/ignition-sandbox/main"


class SandboxAPI:
    """HTTP API wrapper for testing GitHub Pages sandbox"""

    def __init__(self, base_url: str = PAGES_URL):
        self.base_url = base_url.rstrip('/')
        self.timeout = 10
        self.user_agent = 'SandboxAPI/1.0'

    def _request(self, url: str) -> dict:
        """Make HTTP request and return structured response"""
        start = time.time()
        try:
            req = urllib.request.Request(url, headers={'User-Agent': self.user_agent})
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                body = resp.read()
                return {
                    'url': url,
                    'status': resp.status,
                    'headers': dict(resp.headers),
                    'size': len(body),
                    'elapsed_ms': int((time.time() - start) * 1000),
                    'content_hash': hashlib.md5(body).hexdigest(),
                    'success': True,
                    'body': body
                }
        except urllib.error.HTTPError as e:
            return {'url': url, 'status': e.code, 'error': str(e), 'success': False}
        except Exception as e:
            return {'url': url, 'error': str(e), 'success': False}

    def ping(self) -> dict:
        """Health check - just verify site responds"""
        result = self._request(self.base_url)
        return {k: v for k, v in result.items() if k != 'body'}

    def fetch(self, path: str = "") -> dict:
        """Fetch specific path"""
        url = f"{self.base_url}/{path}".rstrip('/')
        result = self._request(url)
        # Remove body from response for cleaner output
        return {k: v for k, v in result.items() if k != 'body'}

    def fetch_raw(self, path: str) -> Optional[bytes]:
        """Fetch and return raw body content"""
        url = f"{self.base_url}/{path}".rstrip('/')
        result = self._request(url)
        return result.get('body') if result.get('success') else None

    def check_files(self, files: List[str]) -> List[dict]:
        """Check multiple files, return status of each"""
        return [self.fetch(f) for f in files]

    def compare_hash(self, path: str, expected_hash: str) -> dict:
        """Compare remote file hash with expected"""
        result = self._request(f"{self.base_url}/{path}")
        if not result.get('success'):
            return {'match': False, 'error': result.get('error')}

        remote_hash = result.get('content_hash', '')[:len(expected_hash)]
        return {
            'path': path,
            'expected': expected_hash,
            'actual': remote_hash,
            'match': remote_hash == expected_hash
        }


class RawGitHubAPI(SandboxAPI):
    """API for raw.githubusercontent.com content"""

    def __init__(self, branch: str = "main"):
        self.branch = branch
        super().__init__(f"https://raw.githubusercontent.com/teslasolar/ignition-sandbox/{branch}")


def test_endpoints():
    """Quick test of all endpoints"""
    api = SandboxAPI()
    print("=== Sandbox API Test ===\n")

    # Ping
    print("1. Ping test:")
    result = api.ping()
    print(f"   Status: {result.get('status', 'ERROR')}")
    print(f"   Time: {result.get('elapsed_ms', 'N/A')}ms\n")

    # Check key files
    print("2. File checks:")
    files = ['index.html', 'ignition-install.sh', 'uuid-resolve']
    for f in files:
        r = api.fetch(f)
        status = 'OK' if r.get('success') else 'FAIL'
        print(f"   {f}: {status} ({r.get('status', 'N/A')})")

    print("\n3. Raw GitHub check:")
    raw = RawGitHubAPI()
    r = raw.fetch('README.md')
    print(f"   README.md: {'OK' if r.get('success') else 'FAIL'}")


if __name__ == '__main__':
    test_endpoints()
