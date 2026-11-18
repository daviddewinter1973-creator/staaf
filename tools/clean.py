"""Zet de Squarespace-export om naar data/works.json voor de nieuwe site.
Dubbele werken (oude 2017-versie en nieuwe 2023-versie van hetzelfde doek) worden
samengevoegd; de nieuwe versie wint, de foto's worden gecombineerd."""
import json, re, html, unicodedata, sys

SRC = '/home/claude/staaf-src/data/'
W = json.load(open(SRC + 'works.json'))
STOCK = json.load(open(SRC + 'sq_stock.json'))

# nieuw (houden) <- oud (opgaan in nieuw)
MERGE = {25: [78], 32: [80], 27: [81], 28: [84], 29: [103], 30: [115], 33: [108], 34: [99],
         65: [76], 69: [92], 75: [94], 74: [102], 72: [101], 73: [113], 24: [77], 145: [71]}
EXTRA_SERIES = {145: ['50jaar']}
SERIES = {'mokum': 'mokum', '50jaar': 'staaf', 'temptation': 'temptation', 'snarfs': 'snarfs', 'prints': 'prints'}

FIX_EN = {'Avalange': 'Avalanche', 'Golden age of balooning': 'Golden age of ballooning',
          'The cak is gone': 'The cake is gone', 'Sunday noon': 'Sunday afternoon',
          "Than don't": "Then don't", 'Danceparty and a tram': 'Dance party and a tram',
          'Up here': 'Until here', 'Squere': 'Squere'}
FIX_NL = {"Stoom'": 'Stoom', 'ingepakte Wester': 'Ingepakte Wester', "drie amigo's": "Drie amigo's",
          "is dit 'm?": "Is dit 'm?", 'ik wist het': 'Ik wist het', 'nou en?': 'Nou en?',
          'show 12': 'Show 12', 'Damrak zeven over twaalf': 'Damrak, zeven over twaalf'}


def titles(t):
    t = html.unescape(t).strip()
    t = re.sub(r'^NEW:\s*', '', t)
    t = re.sub(r'\s*\(\*?Rented out[^)]*\)', '', t)
    t = re.sub(r'\s*\(nog opnieuw fotograferen\)', '', t)
    t = t.lstrip('*').strip()
    if t.startswith("Stoom'"):
        t = "'Stoom' (Steam)"
    if not t or re.fullmatch(r"[\[\-]*\s*no?t? title\s*[\]\-]*", t, re.I):
        return None, None
    if ' | ' in t:
        nl, en = [x.strip() for x in t.split(' | ', 1)]
    else:
        m = re.fullmatch(r"\*?'(.+?)'\s*(?:\((.+)\))?", t)
        if m:
            nl, en = m.group(1).strip(), (m.group(2) or m.group(1)).strip()
        elif ' - ' in t and t.split(' - ')[0] in ('Kauw', 'Jordanese Nijlgans'):
            nl, en = [x.strip() for x in t.split(' - ', 1)]
        else:
            nl = en = t
    nl = nl.strip("'").strip(); en = en.strip("'").strip()
    nl = FIX_NL.get(nl, nl); en = FIX_EN.get(en, en)
    en = en[:1].upper() + en[1:]
    if en.lower() == nl.lower():
        en = nl
    return nl, en


MED = [  # (zoekterm, nl, en)
    (r'acryl(?:ic)? op canvas \(3D doek\)', 'acryl op 3D-doek', 'acrylic on 3D canvas'),
    (r'olie op canvasboard|oil on canvas board', 'olieverf op canvasboard', 'oil on canvas board'),
    (r'olie op hout|oil on wood panel', 'olieverf op paneel', 'oil on wood panel'),
    (r'oil on linen|olie op linnen', 'olieverf op linnen', 'oil on linen'),
    (r'olie op canvas|oil on canvas', 'olieverf op doek', 'oil on canvas'),
    (r'acryl op canvas|acrylic on canvas', 'acryl op doek', 'acrylic on canvas'),
]


def specs(ex, series):
    ex = html.unescape(ex or '')
    ex = re.sub(r'>>>.*', '', ex, flags=re.S)
    if series == 'prints':
        return None
    m = re.search(r'(\d{2,3})\s*(?:cm)?\s*[x×]\s*(\d{2,3})\s*cm', ex)
    size = f'{m.group(1)} × {m.group(2)} cm' if m and not m.group(1).startswith('0') else None
    med = next(((nl, en) for pat, nl, en in MED if re.search(pat, ex, re.I)), None)
    frame = bool(re.search(r'baklijst|frame', ex, re.I))
    cap = lambda x: x[:1].upper() + x[1:]
    return {'size': size, 'medium': {'nl': cap(med[0]), 'en': cap(med[1])} if med else None, 'frame': frame}


def slugify(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().replace("'", '')
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


absorbed = {o for olds in MERGE.values() for o in olds}
works, prints, seen = [], [], set()
untitled = 0
for w in W:
    i = w['idx']
    if i in absorbed:
        continue
    series = SERIES[w['series'][0]]
    nl, en = titles(w['t'])
    if not nl:
        untitled += 1
        nl, en = 'Zonder titel', 'Untitled'
    files = list(w['files'])
    for o in MERGE.get(i, []):
        files += [f for f in W[o]['files']]
    st = STOCK.get(w['id'], [0])
    price = round(float(w['price']) * 100)
    if series == 'prints':
        variants = []
        for (attrs, pr), s in zip(w['vattrs'], st):
            a = [x.strip() for x in attrs.split('|')]
            fr = next(x for x in a if 'frame' in x)
            sz = next(x for x in a if x is not fr)
            dims = re.search(r'\(\s*([\d.,]+)\s*x\s*([\d.,]+)\s*cm', sz)
            fmt = re.search(r'A\d', sz).group(0)
            framed = 'dibond' in fr
            variants.append({'id': f"{fmt.lower()}-{'lijst' if framed else 'los'}", 'format': fmt,
                             'dims': f"{dims.group(1).replace('.', ',')} × {dims.group(2).replace('.', ',')} cm",
                             'framed': framed, 'price': round(float(pr) * 100),
                             'stock': 50 if s == 'U' else int(s)})
        slug = slugify(nl)
        # Eén oplage van 50 voor alle formaten en uitvoeringen samen.
        sold = sum(50 - v['stock'] for v in variants)
        for v in variants: del v['stock']
        prints.append({'slug': slug, 'title': {'nl': nl, 'en': en}, 'edition': 50, 'stock': 50 - sold,
                       'images': files, 'variants': variants})
        continue
    available = st[0] not in (0, '0')
    status = 'beschikbaar' if available else 'verkocht'
    slug = slugify(nl) if nl != 'Zonder titel' else f'zonder-titel-{untitled}'
    base, n = slug, 2
    while slug in seen:
        slug = f'{base}-{n}'; n += 1
    seen.add(slug)
    s = specs(w['ex'], series)
    works.append({'slug': slug, 'title': {'nl': nl, 'en': en},
                  'series': [series] + [SERIES[x] for x in EXTRA_SERIES.get(i, [])],
                  'status': status, 'price': price if price > 0 else None,
                  'size': s['size'], 'medium': s['medium'], 'frame': s['frame'],
                  'images': files, 'src': i})

# volgorde: per reeks zoals op Squarespace, beschikbare werken niet apart
json.dump({'works': works, 'prints': prints}, open('data/works.json', 'w'), ensure_ascii=False, indent=1)
from collections import Counter
print(len(works), 'werken,', len(prints), 'prints')
print(Counter(s for w in works for s in w['series']))
print(Counter(w['status'] for w in works))
print('beschikbaar zonder prijs:', [w['title']['nl'] for w in works if w['status'] == 'beschikbaar' and not w['price']])
print('zonder maat:', [w['title']['nl'] for w in works if not w['size']])
print('zonder techniek:', [w['title']['nl'] for w in works if not w['medium']])
