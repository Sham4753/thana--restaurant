import http.server, json, os, secrets

DATA = 'data.json'
TOKEN_FILE = 'server_token.txt'

if os.path.exists(TOKEN_FILE):
    TOKEN = open(TOKEN_FILE).read().strip()
else:
    TOKEN = secrets.token_hex(16)
    open(TOKEN_FILE,'w').write(TOKEN)
    print('🔑 Token:', TOKEN)

def load():
    if os.path.exists(DATA): return json.load(open(DATA,'r',encoding='utf-8'))
    return {}

def save(d):
    with open(DATA+'.tmp','w',encoding='utf-8') as f: json.dump(d,f,ensure_ascii=False)
    os.replace(DATA+'.tmp', DATA)

class H(http.server.SimpleHTTPRequestHandler):
    def _ok(self, data={'ok':True}):
        self.send_response(200); self.send_header('Content-Type','application/json'); self.send_header('Access-Control-Allow-Origin','*'); self.end_headers()
        self.wfile.write(json.dumps(data,ensure_ascii=False).encode())
    
    def _err(self, code, msg):
        self.send_response(code); self.send_header('Content-Type','application/json'); self.send_header('Access-Control-Allow-Origin','*'); self.end_headers()
        self.wfile.write(json.dumps({'error':msg},ensure_ascii=False).encode())
    
    def do_OPTIONS(self):
        self.send_response(204); self.send_header('Access-Control-Allow-Origin','*'); self.send_header('Access-Control-Allow-Headers','X-Auth-Token, Content-Type'); self.send_header('Access-Control-Allow-Methods','GET, POST, OPTIONS'); self.end_headers()
    
    # ========== زبون QR ==========
    def do_POST(self):
        # POST /api/order ← زبون QR يرسل طلب (بدون توكن)
        if self.path == '/api/order':
            try:
                l = int(self.headers['Content-Length'])
                order = json.loads(self.rfile.read(l))
                d = load()
                orders = d.get('thana_orders', [])
                order['id'] = order.get('id', int(__import__('time').time()*1000))
                orders.append(order)
                d['thana_orders'] = orders
                save(d)
                self._ok({'id': order['id']})
            except: self._err(400, 'invalid')
        else: super().do_POST()
    
    # ========== موظفين ==========
    def do_GET(self):
        # GET /api/data ← موظفين يقرأوا كل البيانات (بتوكن)
        if self.path == '/api/data':
            if self.headers.get('X-Auth-Token') != TOKEN:
                self._err(401, 'unauthorized'); return
            self._ok(load())
        else: super().do_GET()

if __name__ == '__main__':
    print('🚀 http://localhost:3000')
    http.server.HTTPServer(('0.0.0.0',3000), H).serve_forever()
