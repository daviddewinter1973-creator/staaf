"""Lokale server die doet wat Netlify doet: /werk/eten -> werk/eten.html, onbekend -> index.html."""
import http.server, functools, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class H(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        p = path.split('?')[0].split('#')[0]
        f = os.path.join(ROOT, p.lstrip('/'))
        if os.path.isdir(f) and os.path.isfile(os.path.join(f, 'index.html')): return os.path.join(f, 'index.html')
        if os.path.isfile(f): return f
        if os.path.isfile(f.rstrip('/') + '.html'): return f.rstrip('/') + '.html'
        if p.startswith('/api/') or p.startswith('/.netlify/'): return '/nonexistent'
        return os.path.join(ROOT, 'en/index.html' if p.startswith('/en/') else 'index.html')
    def log_message(self, *a): pass
http.server.ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1]) if len(sys.argv) > 1 else 8770), functools.partial(H, directory=ROOT)).serve_forever()
