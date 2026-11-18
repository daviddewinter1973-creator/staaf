// Beheer: alleen met ADMIN_PASSWORD (in Netlify ingesteld).
import { createHash, timingSafeEqual } from 'node:crypto';
import { currentState, getBasis, saveBasis, getSales, cleanPatch, loadData, images } from './lib/state.mjs';

const json = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
});
const h = s => createHash('sha256').update(String(s)).digest();
const slugify = s => String(s).normalize('NFKD').replace(/[̀-ͯ']/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Alleen POST' });
  const pw = process.env.ADMIN_PASSWORD;
  let body;
  try { body = await req.json(); } catch { return json(400, { error: 'Ongeldig verzoek' }); }
  if (!pw || !timingSafeEqual(h(body.password || ''), h(pw))) {
    await new Promise(r => setTimeout(r, 800));
    return json(401, { error: 'Wachtwoord klopt niet.' });
  }
  const site = new URL(req.url).origin;
  const now = new Date().toISOString();

  if (body.action === 'get') {
    const data = await loadData(site);
    const [state, sales] = await Promise.all([currentState(site, data), getSales()]);
    return json(200, { ...state, sales: sales.slice(0, 50), now });
  }

  if (body.action === 'save') {
    const data = await loadData(site);
    const basis = await getBasis();
    // asOf = het moment waarop David de pagina laadde. Verkopen daarna blijven gelden.
    const asOf = body.asOf && body.asOf < now ? body.asOf : now;
    const before = await currentState(site, data);
    for (const [slug, patch] of Object.entries(body.works || {})) {
      if (!before.works[slug]) continue;
      const p = cleanPatch(patch);
      // Status altijd vastleggen, anders zou een prijswijziging een verkocht werk weer vrijgeven.
      if (!p.status) p.status = before.works[slug].status;
      basis.works[slug] = { ...(basis.works[slug] || {}), ...p, at: asOf };
    }
    if (body.prints && Object.keys(body.prints).length) {
      const next = { ...before.prints };
      for (const p of data.prints) {
        if (p.slug in body.prints) next[p.slug] = Math.max(0, Math.min(999, parseInt(body.prints[p.slug], 10) || 0));
      }
      basis.prints = next; basis.printsAt = now;
    }
    await saveBasis(basis);
    return json(200, { ok: true, ...(await currentState(site, data)), now });
  }

  if (body.action === 'upload') {
    // Eén formaat van één foto, al in de browser verkleind tot WebP.
    const name = String(body.name || '');
    if (!/^[a-z0-9-]+-\d+-(600|1200|2000)\.webp$/.test(name)) return json(400, { error: 'Ongeldige bestandsnaam' });
    const buf = Buffer.from(String(body.data || ''), 'base64');
    if (buf.length < 100 || buf.length > 4_000_000) return json(400, { error: 'Foto is te groot of leeg' });
    await images().set(name, buf);
    return json(200, { ok: true, url: `/beeld/${name}` });
  }

  if (body.action === 'add') {
    const data = await loadData(site);
    const basis = await getBasis();
    const w = body.work || {};
    const p = cleanPatch({ status: 'beschikbaar', ...w });
    if (!p.title?.nl) return json(400, { error: 'Geef het werk een titel.' });
    let slug = slugify(w.slug || p.title.nl) || 'werk';
    const taken = new Set([...data.works, ...basis.extra].map(x => x.slug));
    for (let n = 2, b = slug; taken.has(slug); n++) slug = `${b}-${n}`;
    const pics = (Array.isArray(w.pics) ? w.pics : []).slice(0, 12).map(x => ({
      r: Math.max(.2, Math.min(5, +x.r || 1)), max: [600, 1200, 2000].includes(+x.max) ? +x.max : 1200,
      u: /^\/beeld\/[a-z0-9-]+$/.test(x.u) ? x.u : null
    })).filter(x => x.u);
    if (!pics.length) return json(400, { error: 'Voeg minstens één foto toe.' });
    basis.extra.unshift({ slug, frame: !!w.frame, added: now, pics, ...p, title: p.title, series: p.series || [] });
    await saveBasis(basis);
    return json(200, { ok: true, slug });
  }

  if (body.action === 'remove') {
    const basis = await getBasis();
    basis.extra = basis.extra.filter(w => w.slug !== body.slug);
    delete basis.works[body.slug];
    await saveBasis(basis);
    return json(200, { ok: true });
  }

  return json(400, { error: 'Onbekende actie' });
};
