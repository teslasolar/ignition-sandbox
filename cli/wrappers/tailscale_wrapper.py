#!/usr/bin/env python3
"""
Tailscale integration for Ignition Sandbox
Test connectivity and expose sandbox through Tailscale Funnel/Serve
"""
import subprocess
import json
import socket
import os
from typing import Optional, Dict, Any

PAGES_URL = "https://teslasolar.github.io/ignition-sandbox"


class TailscaleWrapper:
    """Wrapper for Tailscale CLI operations"""

    def __init__(self):
        self.available = self._check_available()
        self.status_cache = None

    def _check_available(self) -> bool:
        """Check if tailscale CLI is available"""
        try:
            subprocess.run(['tailscale', 'version'],
                         capture_output=True, timeout=5)
            return True
        except:
            return False

    def _run(self, args: list, timeout: int = 10) -> Dict[str, Any]:
        """Run tailscale command and return result"""
        if not self.available:
            return {'error': 'Tailscale not installed', 'available': False}

        try:
            result = subprocess.run(
                ['tailscale'] + args,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            return {
                'success': result.returncode == 0,
                'stdout': result.stdout.strip(),
                'stderr': result.stderr.strip(),
                'code': result.returncode
            }
        except subprocess.TimeoutExpired:
            return {'error': 'Command timed out', 'timeout': True}
        except Exception as e:
            return {'error': str(e)}

    def status(self) -> Dict[str, Any]:
        """Get Tailscale status"""
        result = self._run(['status', '--json'])
        if result.get('success') and result.get('stdout'):
            try:
                self.status_cache = json.loads(result['stdout'])
                return self.status_cache
            except:
                pass
        return result

    def ip(self) -> Optional[str]:
        """Get this machine's Tailscale IP"""
        result = self._run(['ip', '-4'])
        if result.get('success'):
            return result.get('stdout')
        return None

    def ping(self, target: str, count: int = 3) -> Dict[str, Any]:
        """Ping a Tailscale peer"""
        result = self._run(['ping', '-c', str(count), target], timeout=30)
        return result

    def is_connected(self) -> bool:
        """Check if Tailscale is connected"""
        status = self.status()
        return status.get('BackendState') == 'Running'

    def peers(self) -> list:
        """List connected peers"""
        status = self.status()
        if isinstance(status, dict) and 'Peer' in status:
            return [
                {
                    'name': peer.get('HostName', 'unknown'),
                    'ip': peer.get('TailscaleIPs', [''])[0],
                    'online': peer.get('Online', False),
                    'os': peer.get('OS', '')
                }
                for peer in status['Peer'].values()
            ]
        return []

    def funnel_status(self) -> Dict[str, Any]:
        """Check Funnel status (public HTTPS exposure)"""
        result = self._run(['funnel', 'status'])
        return result

    def serve_status(self) -> Dict[str, Any]:
        """Check Serve status (Tailnet-only exposure)"""
        result = self._run(['serve', 'status'])
        return result


class SandboxTailscaleTest:
    """Test GitHub Pages sandbox through Tailscale"""

    def __init__(self):
        self.ts = TailscaleWrapper()

    def test_connectivity(self) -> Dict[str, Any]:
        """Full connectivity test"""
        results = {
            'tailscale_available': self.ts.available,
            'tests': []
        }

        if not self.ts.available:
            results['message'] = 'Install Tailscale: https://tailscale.com/download'
            return results

        # Check connection
        if self.ts.is_connected():
            results['connected'] = True
            results['tailscale_ip'] = self.ts.ip()
            results['peers'] = len(self.ts.peers())
        else:
            results['connected'] = False
            results['message'] = 'Tailscale not connected. Run: tailscale up'
            return results

        # Test fetching GitHub Pages through Tailscale DNS
        import urllib.request
        try:
            req = urllib.request.Request(PAGES_URL, headers={'User-Agent': 'TailscaleTest/1.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                results['tests'].append({
                    'name': 'github_pages_fetch',
                    'success': resp.status == 200,
                    'status': resp.status
                })
        except Exception as e:
            results['tests'].append({
                'name': 'github_pages_fetch',
                'success': False,
                'error': str(e)
            })

        return results

    def setup_funnel(self, port: int = 8088) -> Dict[str, Any]:
        """
        Setup Tailscale Funnel to expose local Ignition gateway publicly.
        This allows sharing the WebVM-hosted Ignition with anyone via HTTPS.
        """
        if not self.ts.available:
            return {'error': 'Tailscale not available'}

        # Enable HTTPS for funnel
        result = self.ts._run(['funnel', str(port)])
        return {
            'action': 'funnel',
            'port': port,
            'result': result,
            'usage': f'Access via: https://<your-tailnet-name>.ts.net:{port}'
        }

    def setup_serve(self, port: int = 8088) -> Dict[str, Any]:
        """
        Setup Tailscale Serve to expose local Ignition to Tailnet only.
        More secure - only accessible by your Tailscale network.
        """
        if not self.ts.available:
            return {'error': 'Tailscale not available'}

        result = self.ts._run(['serve', str(port)])
        return {
            'action': 'serve',
            'port': port,
            'result': result,
            'usage': f'Access via Tailnet: https://<machine-name>.<tailnet>.ts.net'
        }

    def proxy_test(self, target_ip: str) -> Dict[str, Any]:
        """Test accessing a peer's service through Tailscale"""
        # Ping the peer first
        ping_result = self.ts.ping(target_ip, count=1)

        # Try HTTP connection
        import urllib.request
        http_result = {'tested': False}
        try:
            url = f"http://{target_ip}:8088"
            req = urllib.request.Request(url, headers={'User-Agent': 'TailscaleTest/1.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                http_result = {
                    'tested': True,
                    'success': True,
                    'url': url,
                    'status': resp.status
                }
        except Exception as e:
            http_result = {
                'tested': True,
                'success': False,
                'error': str(e)
            }

        return {
            'target': target_ip,
            'ping': ping_result,
            'http': http_result
        }


def main():
    """CLI entry point"""
    import sys

    tester = SandboxTailscaleTest()

    if len(sys.argv) < 2:
        print("Tailscale Sandbox Integration")
        print("\nUsage:")
        print("  tailscale-test status     # Check Tailscale status")
        print("  tailscale-test peers      # List connected peers")
        print("  tailscale-test test       # Full connectivity test")
        print("  tailscale-test funnel     # Setup Funnel (public HTTPS)")
        print("  tailscale-test serve      # Setup Serve (Tailnet only)")
        print("  tailscale-test proxy <ip> # Test peer connection")
        return

    cmd = sys.argv[1]

    if cmd == 'status':
        result = tester.ts.status()
        if isinstance(result, dict):
            if result.get('BackendState'):
                print(f"State: {result.get('BackendState')}")
                print(f"IP: {tester.ts.ip()}")
            else:
                print(json.dumps(result, indent=2))
        else:
            print(result)

    elif cmd == 'peers':
        peers = tester.ts.peers()
        if peers:
            for p in peers:
                status = '●' if p['online'] else '○'
                print(f"{status} {p['name']:20} {p['ip']:15} ({p['os']})")
        else:
            print("No peers found or Tailscale not connected")

    elif cmd == 'test':
        result = tester.test_connectivity()
        print(json.dumps(result, indent=2))

    elif cmd == 'funnel':
        port = int(sys.argv[2]) if len(sys.argv) > 2 else 8088
        result = tester.setup_funnel(port)
        print(json.dumps(result, indent=2))

    elif cmd == 'serve':
        port = int(sys.argv[2]) if len(sys.argv) > 2 else 8088
        result = tester.setup_serve(port)
        print(json.dumps(result, indent=2))

    elif cmd == 'proxy' and len(sys.argv) > 2:
        result = tester.proxy_test(sys.argv[2])
        print(json.dumps(result, indent=2))

    else:
        print(f"Unknown command: {cmd}")


if __name__ == '__main__':
    main()
