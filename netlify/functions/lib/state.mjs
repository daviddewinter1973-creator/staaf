// De levende stand van de site, bovenop data.json:
//  - basis: wat David in /beheer instelt (status, prijs, teksten per werk; voorraad per print;
//    nieuwe werken die hij zelf toevoegt)
//  - verkoop/<betaling>: één record per betaalde bestelling (nooit overschreven)
//  - hold/<werk>: een origineel dat iemand op dit moment afrekent
import { getStore } from '@netlify/blobs';

export const store = () => getStore({ name: 'staaf', consistency: 'strong' });
export const images = () => getStore('beelden');

const HOLD_MS = 20 * 60 * 1000;

export async function loadData(origin) {
  const r = await fetch(`${origin}/data.json`, { headers: { 'cache-control': 'no-cache' } });
  return r.json();
}

export const printKey = (slug, variant) => `${slug}/${variant}`;

export async function getBasis() {
  const b = await store().get('basis', { type: 'json' });
  return {
    works: {}, extra: [], prints: null, printsAt: '1970-01-01T00:00:00.000Z',
    ...(b || {})
  };
}

export async function getSales() {
  const s = store();
  const { blobs } = await s.list({ prefix: 'verkoop/' });
  const out = await Promise.all(blobs.map(b => s.get(b.key, { type: 'json' })));
  return out.filter(Boolean).sort((a, b) => a.at < b.at ? 1 : -1);
}

async function getHolds() {
  const s = store();
  const { blobs } = await s.list({ prefix: 'hold/' });
  const now = Date.now();
  const out = {};
  await Promise.all(blobs.map(async b => {
    const h = await s.get(b.key, { type: 'json' });
    if (h && h.until > now) out[b.key.slice(5)] = h;
  }));
  return out;
}

// Alle werken (uit data.json en zelf toegevoegd) met de actuele status, plus printvoorraad.
export async function currentState(origin, data) {
  data = data || await loadData(origin);
  const [basis, sales, holds] = await Promise.all([getBasis(), getSales(), getHolds()]);

  const lastSale = {};
  const soldPrints = {};
  for (const sale of sales) {
    for (const [kind, slug, variant, qty] of sale.items) {
      if (kind === 'work') { if (!lastSale[slug] || sale.at > lastSale[slug]) lastSale[slug] = sale.at; }
      else if (sale.at > basis.printsAt) {
        const k = printKey(slug, variant);
        soldPrints[k] = (soldPrints[k] || 0) + qty;
      }
    }
  }

  const works = {};
  const all = [...data.works, ...basis.extra];
  for (const w of all) {
    const o = basis.works[w.slug] || {};
    const cur = { ...pick(w), ...stripMeta(o) };
    // Een verkoop na de laatste aanpassing in /beheer maakt het werk verkocht.
    if (lastSale[w.slug] && lastSale[w.slug] > (o.at || '')) cur.status = 'verkocht';
    if (holds[w.slug] && cur.status === 'beschikbaar') cur.held = true;
    works[w.slug] = cur;
  }

  const prints = {};
  for (const p of data.prints) for (const v of p.variants) {
    const k = printKey(p.slug, v.id);
    const base = basis.prints && typeof basis.prints[k] === 'number' ? basis.prints[k] : v.stock;
    prints[k] = Math.max(0, base - (soldPrints[k] || 0));
  }
  return { works, extra: basis.extra, prints, printsAt: basis.printsAt };
}

const EDITABLE = ['status', 'price', 'title', 'size', 'medium', 'series', 'hidden', 'note'];
function pick(w) { const o = {}; for (const k of EDITABLE) if (w[k] !== undefined) o[k] = w[k]; return o; }
function stripMeta(o) { const { at, ...rest } = o; return rest; }

export function cleanPatch(p) {
  const o = {};
  if (['beschikbaar', 'gereserveerd', 'verkocht', 'niet te koop'].includes(p.status)) o.status = p.status;
  if (p.price === null || p.price === '') o.price = null;
  else if (Number.isFinite(+p.price) && +p.price >= 0) o.price = Math.round(+p.price);
  const txt = (s, n) => String(s ?? '').slice(0, n).trim();
  if (p.title) o.title = { nl: txt(p.title.nl, 120), en: txt(p.title.en || p.title.nl, 120) };
  if ('size' in p) o.size = txt(p.size, 40) || null;
  if (p.medium) o.medium = { nl: txt(p.medium.nl, 80), en: txt(p.medium.en || p.medium.nl, 80) };
  if (Array.isArray(p.series)) o.series = p.series.map(s => txt(s, 20)).filter(Boolean).slice(0, 4);
  if ('hidden' in p) o.hidden = !!p.hidden;
  if ('note' in p) o.note = p.note ? { nl: txt(p.note.nl, 2000), en: txt(p.note.en, 2000) } : null;
  return o;
}

export async function saveBasis(basis) {
  await store().setJSON('basis', basis);
  return basis;
}

export async function setHolds(slugs, paymentId) {
  const s = store();
  const until = Date.now() + HOLD_MS;
  await Promise.all(slugs.map(slug => s.setJSON(`hold/${slug}`, { until, pay: paymentId })));
}

export async function clearHolds(slugs, paymentId) {
  const s = store();
  await Promise.all(slugs.map(async slug => {
    const h = await s.get(`hold/${slug}`, { type: 'json' });
    if (h && (!paymentId || h.pay === paymentId)) await s.delete(`hold/${slug}`);
  }));
}

// Idempotent: een betaling telt één keer, ook als Mollie de webhook vaker stuurt.
export async function recordSale(paymentId, items, extra = {}) {
  const s = store();
  const key = `verkoop/${paymentId}`;
  if (await s.get(key, { type: 'json' })) return false;
  await s.setJSON(key, { id: paymentId, items, at: new Date().toISOString(), ...extra });
  return true;
}
