#!/usr/bin/env python3
"""
IDP Dashboard Browser Access Fix
Simple HTTP proxy/redirect to help with localhost connection issues
"""

import http.server
import socketserver
import urllib.request
import webbrowser
import threading
import time

PORT = 8080
DASHBOARD_URL = "http://localhost:3001"

class DashboardProxy(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Forward request to actual dashboard
            if self.path == '/':
                # Serve the dashboard content
                response = urllib.request.urlopen(DASHBOARD_URL)
                content = response.read()
                
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(content)
                
            elif self.path.startswith('/metrics') or self.path.startswith('/health'):
                # Forward API requests
                response = urllib.request.urlopen(DASHBOARD_URL + self.path)
                content = response.read()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(content)
                
            else:
                # Redirect other requests to dashboard
                self.send_response(302)
                self.send_header('Location', DASHBOARD_URL + self.path)
                self.end_headers()
                
        except Exception as e:
            # Error page
            self.send_response(503)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            error_page = f"""
            <html>
            <head><title>IDP Dashboard Access</title></head>
            <body>
                <h1>🔧 Dashboard Connection Issue</h1>
                <p><strong>Primary dashboard at {DASHBOARD_URL} is not accessible.</strong></p>
                <p>Error: {str(e)}</p>
                
                <h2>🛠️ Troubleshooting Steps:</h2>
                <ol>
                    <li>Check if dashboard service is running</li>
                    <li>Try: <a href="{DASHBOARD_URL}">{DASHBOARD_URL}</a></li>
                    <li>Try: <a href="http://127.0.0.1:3001">http://127.0.0.1:3001</a></li>
                    <li>Restart dashboard service</li>
                </ol>
                
                <h2>📊 Service Status Check:</h2>
                <pre>
Run these commands:
ps aux | grep production-monitoring-system
curl http://localhost:3001/health
                </pre>
            </body>
            </html>
            """
            self.wfile.write(error_page.encode())

def start_proxy():
    """Start the proxy server"""
    with socketserver.TCPServer(("", PORT), DashboardProxy) as httpd:
        print(f"🌐 Dashboard proxy running at: http://localhost:{PORT}")
        print(f"🔗 Forwarding to: {DASHBOARD_URL}")
        print("🚀 Opening browser...")
        
        # Open browser after a short delay
        def open_browser():
            time.sleep(2)
            try:
                webbrowser.open(f"http://localhost:{PORT}")
            except Exception as e:
                print(f"⚠️ Could not auto-open browser: {e}")
                print(f"📱 Manually open: http://localhost:{PORT}")
        
        threading.Thread(target=open_browser, daemon=True).start()
        
        print("🛑 Press Ctrl+C to stop")
        httpd.serve_forever()

if __name__ == "__main__":
    print("🚀 IDP Dashboard Browser Access Fix")
    print("===================================")
    print(f"🎯 Target Dashboard: {DASHBOARD_URL}")
    print(f"🌐 Proxy Port: {PORT}")
    print()
    
    try:
        start_proxy()
    except KeyboardInterrupt:
        print("\n🛑 Proxy stopped")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("🔧 Make sure no other service is using port 8080")