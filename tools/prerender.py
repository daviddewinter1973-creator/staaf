"""Bouwt elke pagina vooraf op als losse HTML (NL en EN), zodat bezoekers en zoekmachines
direct inhoud zien. Draai na elke wijziging in data.json, app.js of de vormgeving:
    python3 tools/prerender.py
Het script start zelf een lokale server; de bron van de paginaschil is tools/shell.html."""
import asyncio, json, os, re, threading, http.server, functools, html as H
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHELL = open(os.path.join(ROOT, 'tools/shell.html')).read()
PORT = 8766
SITE = 'https://www.staaf.nl'


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?')[0]
        f = os.path.join(ROOT, path.lstrip('/'))
        if path.startswith('/api/'):
            self.send_error(404); return
        if os.path.isfile(f) and not path.endswith('.html') and path != '/':
            return super().do_GET()
        body = SHELL.encode()
        self.send_response(200); self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)

    def log_message(self, *a):
        pass


def serve():
    h = functools.partial(Handler, directory=ROOT)
    http.server.ThreadingHTTPServer(('127.0.0.1', PORT), h).serve_forever()


data = json.load(open(os.path.join(ROOT, 'data.json')))
P = {
    'nl': {'home': '/', 'work': '/werk/', 'prints': '/prints', 'print': '/prints/', 'commissions': '/opdrachten', 'about': '/over', 'cart': '/winkelwagen', 'thanks': '/bedankt'},
    'en': {'home': '/en/', 'work': '/en/work/', 'prints': '/en/prints', 'print': '/en/prints/', 'commissions': '/en/commissions', 'about': '/en/about', 'cart': '/en/cart', 'thanks': '/en/thanks'},
}
DESC = {
    'nl': {'home': 'Schilderijen van Staaf (David de Winter): Mokum in olie, 50 jaar Staaf, Temptation en Snarfs. Originelen, gesigneerde prints en schilderijen in opdracht. Galerie Staaf, Bloemgracht 158, Amsterdam.',
           'prints': 'Gesigneerde Baryta fine art prints van Staaf, in een oplage van 50 per formaat. Los of ingelijst.',
           'commissions': 'Laat een persoonlijk olieverfschilderij maken door Staaf: een stadsgezicht, je voordeur, een stilleven of een portret. Richtprijzen vanaf € 850.',
           'about': 'Staaf is de schildersnaam van David de Winter. Atelier en galerie aan de Bloemgracht 158 in Amsterdam, sinds 2005.'},
    'en': {'home': 'Paintings by Staaf (David de Winter): Mokum in oil, 50 years of Staaf, Temptation and Snarfs. Originals, signed prints and commissions. Galerie Staaf, Bloemgracht 158, Amsterdam.',
           'prints': 'Signed Baryta fine art prints by Staaf, in an edition of 50 per size. Unframed or framed.',
           'commissions': 'Commission a personal oil painting by Staaf: a cityscape, your front door, a still life or a portrait. Guide prices from € 850.',
           'about': 'Staaf is the painter name of David de Winter. Studio and gallery at Bloemgracht 158, Amsterdam, since 2005.'},
}


def routes():
    for lang in ('nl', 'en'):
        for name in ('home', 'prints', 'commissions', 'about', 'cart', 'thanks'):
            yield lang, name, None
        for w in data['works']:
            yield lang, 'work', w['slug']
        for p in data['prints']:
            yield lang, 'print', p['slug']


def path_of(lang, name, slug):
    return P[lang][name] + (slug or '')


def file_of(path):
    if path in ('/', '/en/'):
        return path.lstrip('/') + 'index.html'
    return path.lstrip('/') + '.html'


def meta(lang, name, slug):
    t = lambda o: o.get(lang) or o['nl']
    img = f"{SITE}/img/w/{data['featured']}-0-1200.webp"
    if name == 'work':
        w = next(x for x in data['works'] if x['slug'] == slug)
        bits = [t(w['medium'])[:1].upper() + t(w['medium'])[1:]] if w.get('medium') else []
        if w.get('size'): bits.append(w['size'])
        state = {'beschikbaar': ('Te koop', 'For sale'), 'verkocht': ('Verkocht', 'Sold')}.get(w['status'], ('', ''))[lang == 'en']
        ti = t(w['title']); ti = ti if ti[-1] in '.!?' else ti + '.'
        d = f"{ti} {', '.join(bits) + '. ' if bits else ''}" + ('Schilderij van Staaf. ' if lang == 'nl' else 'Painting by Staaf. ') + state
        img = f"{SITE}/img/w/{slug}-0-1200.webp"
        return d.strip(), img
    if name == 'print':
        p = next(x for x in data['prints'] if x['slug'] == slug)
        d = (f"Gesigneerde print van {t(p['title'])}, Baryta fine art, oplage 50 per formaat." if lang == 'nl'
             else f"Signed print of {t(p['title'])}, Baryta fine art, edition of 50 per size.")
        return d, f"{SITE}/img/w/print-{slug}-0-1200.webp"
    return DESC[lang].get(name, DESC[lang]['home']), img


FONT = re.search(r'<link rel="preload" as="style"[^>]+>', SHELL).group(0)


async def main():
    threading.Thread(target=serve, daemon=True).start()
    n = 0
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1440, 'height': 900})
        await ctx.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        await ctx.route('**/*.webp', lambda r: r.fulfill(status=200, content_type='image/webp', body=b''))
        pg = await ctx.new_page()
        for lang, name, slug in routes():
            path = path_of(lang, name, slug)
            await pg.goto(f'http://127.0.0.1:{PORT}{path}')
            await pg.wait_for_function('document.getElementById("view").dataset.route')
            desc, img = meta(lang, name, slug)
            other = 'en' if lang == 'nl' else 'nl'
            alt = path_of(other, name, slug)
            await pg.evaluate('''([desc, img, url, alt, other, title, noindex]) => {
              const set = (sel, attr, val) => { const e = document.querySelector(sel); if (e) e.setAttribute(attr, val); };
              set('meta[name="description"]', 'content', desc);
              set('meta[property="og:description"]', 'content', desc);
              set('meta[property="og:title"]', 'content', title);
              set('meta[property="og:image"]', 'content', img);
              const head = document.head;
              const add = (h) => head.insertAdjacentHTML('beforeend', h);
              add('<link rel="canonical" href="' + url + '">');
              add('<link rel="alternate" hreflang="' + document.documentElement.lang + '" href="' + url + '">');
              add('<link rel="alternate" hreflang="' + other + '" href="' + alt + '">');
              if (noindex) add('<meta name="robots" content="noindex">');
              document.querySelectorAll('.toast,.lb').forEach(e => e.remove());
            }''', [desc, img, SITE + path, SITE + alt, other, await pg.title(), name in ('cart', 'thanks')])
            doc = await pg.evaluate('"<!DOCTYPE html>\\n" + document.documentElement.outerHTML')
            doc = re.sub(r'<link rel="stylesheet" as="style"[^>]+>', FONT, doc)
            out = os.path.join(ROOT, file_of(path))
            os.makedirs(os.path.dirname(out) or ROOT, exist_ok=True)
            open(out, 'w').write(doc)
            n += 1
        await b.close()
    # sitemap
    urls = [SITE + path_of(l, nm, s) for l, nm, s in routes() if nm not in ('cart', 'thanks')]
    open(os.path.join(ROOT, 'sitemap.xml'), 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        ''.join(f'<url><loc>{H.escape(u)}</loc></url>\n' for u in urls) + '</urlset>\n')
    print(n, 'pagina\'s')

asyncio.run(main())
