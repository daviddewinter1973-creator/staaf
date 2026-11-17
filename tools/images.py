"""Maakt WebP-versies van alle foto's en schrijft de afmetingen terug in data/works.json.
img/w/<slug>-<n>-600.webp, -1200.webp en (alleen als de bron groot genoeg is) -2000.webp."""
import json, os, sys
from concurrent.futures import ProcessPoolExecutor
from PIL import Image, ImageOps

SRC = '/home/claude/staaf-src/'
OUT = 'img/w'
os.makedirs(OUT, exist_ok=True)
SIZES = (600, 1200, 2000)


def save(im, path, w):
    q = 82
    r = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    while True:
        r.save(path, 'WEBP', quality=q, method=6)
        if os.path.getsize(path) < 380_000 or q <= 55:
            return
        q -= 7


def job(args):
    src, stem = args
    im = ImageOps.exif_transpose(Image.open(SRC + src)).convert('RGB')
    made = []
    for w in SIZES:
        if w > 600 and im.width < w * 0.8:
            continue
        p = f'{OUT}/{stem}-{w}.webp'
        if not os.path.exists(p):
            save(im, p, w)
        made.append(w)
    return stem, im.width, im.height, made


if __name__ == '__main__':
    d = json.load(open('data/works.json'))
    jobs, owners = [], []
    for kind in ('works', 'prints'):
        for w in d[kind]:
            for n, f in enumerate(w['images']):
                jobs.append((f, f"{'print-' if kind == 'prints' else ''}{w['slug']}-{n}"))
                owners.append((w, n))
    with ProcessPoolExecutor() as ex:
        res = list(ex.map(job, jobs, chunksize=4))
    for (w, n), (stem, iw, ih, made) in zip(owners, res):
        if n == 0:
            w['pics'] = []
        w['pics'].append({'r': round(iw / ih, 4), 'max': max(made)})
    for kind in ('works', 'prints'):
        for w in d[kind]:
            del w['images']
    json.dump(d, open('data/works.json', 'w'), ensure_ascii=False, indent=1)
    tot = sum(os.path.getsize(f'{OUT}/{f}') for f in os.listdir(OUT))
    print(len(res), 'foto\'s,', len(os.listdir(OUT)), 'bestanden,', round(tot / 1e6), 'MB')
