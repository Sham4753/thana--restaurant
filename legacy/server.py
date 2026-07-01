import http.server
import json
import os
import urllib.parse

DATA_FILE = 'data.json'

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)

class APIHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/'):
            key = self.path[5:]
            data = load_data()
            value = data.get(key, '[]')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(value, ensure_ascii=False).encode())
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path.startswith('/api/'):
            key = self.path[5:]
            length = int(self.headers['Content-Length'])
            body = self.rfile.read(length)
            value = json.loads(body)
            data = load_data()
            data[key] = value
            save_data(data)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    PORT = 3000
    print(f'🚀 Thana Server: http://localhost:{PORT}')
    http.server.HTTPServer(('0.0.0.0', PORT), APIHandler).serve_forever()
