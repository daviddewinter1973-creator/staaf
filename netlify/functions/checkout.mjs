// Maakt een Mollie-betaling aan. Prijzen, status en voorraad komen altijd van de server.
// Nodig in Netlify: MOLLIE_API_KEY.
import { currentState, loadData, printKey, setHolds } from './lib/state.mjs';
import '../../shipping.js';

const json = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json' }
});

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'POST only' });
  let body;
  try { body = await req.json(); } catch { return json(400, { error: 'bad' }); }
  const en = body.lang === 'en';
  const T = (nl, e) => en ? e : nl;
  const key = process.env.MOLLIE_API_KEY;
  if (!key) return json(500, { error: T('Betalen is nog niet ingesteld.', 'Payments are not set up yet.') });

  const site = new URL(req.url).origin;
  const data = await loadData(site);
  const state = await currentState(site, data);
  const allWorks = [...data.works, ...state.extra];

  const items = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
  if (!items.length) return json(400, { error: T('Je winkelwagen is leeg.', 'Your cart is empty.') });

  const lines = [], meta = [], holds = [], wanted = {};
  let total = 0;
  for (const l of items) {
    if (l.kind === 'work') {
      const base = allWorks.find(w => w.slug === l.slug);
      const w = base && state.works[l.slug];
      if (!w || w.hidden) return json(400, { error: T('Een van de werken bestaat niet meer. Vernieuw de pagina.', 'One of the works no longer exists. Please refresh.') });
      const title = w.title[en ? 'en' : 'nl'];
      if (w.status !== 'beschikbaar' || !w.price) return json(409, { error: T(`${title} is helaas niet meer te koop.`, `${title} is no longer for sale.`) });
      if (w.held) return json(409, { error: T(`Iemand rekent ${title} op dit moment af. Probeer het over twintig minuten nog eens.`, `Someone is checking out ${title} right now. Try again in twenty minutes.`) });
      if (holds.includes(l.slug)) continue;
      holds.push(l.slug);
      lines.push({ kind: 'work', name: `${w.title.nl} (origineel)`, qty: 1, price: w.price });
      meta.push(['work', l.slug, '', 1]);
      total += w.price;
    } else {
      const p = data.prints.find(x => x.slug === l.slug);
      const v = p && p.variants.find(x => x.id === l.variant);
      if (!v) return json(400, { error: T('Een van de prints bestaat niet meer. Vernieuw de pagina.', 'One of the prints no longer exists. Please refresh.') });
      const qty = Math.max(1, Math.min(10, parseInt(l.qty, 10) || 1));
      const k = printKey(p.slug, v.id);
      wanted[k] = (wanted[k] || 0) + qty;
      const left = state.prints[k] ?? 0;
      if (left < wanted[k]) return json(409, { error: left === 0
        ? T(`${p.title.nl} (${v.format}) is uitverkocht.`, `${p.title.en} (${v.format}) is sold out.`)
        : T(`Van ${p.title.nl} (${v.format}) zijn er nog ${left}.`, `Only ${left} left of ${p.title.en} (${v.format}).`) });
      lines.push({ kind: 'print', framed: v.framed, name: `Print ${p.title.nl}, ${v.format}${v.framed ? ' ingelijst' : ''}`, qty, price: v.price });
      meta.push(['print', p.slug, v.id, qty]);
      total += v.price * qty;
    }
  }

  const ship = String(body.shipping || '');
  const s = globalThis.StaafShipping.calc(data.shipping, lines, ship);
  if (!s.ok) return json(400, { error: T('Kies hoe je de bestelling wilt ontvangen.', 'Choose how you want to receive your order.') });
  total += s.price;

  const c = body.customer || {};
  const clean = (v, n = 120) => String(v || '').slice(0, n).trim();
  const klant = {
    n: clean(c.name, 80), e: clean(c.email, 100), t: clean(c.phone, 30),
    a: ship === 'pickup' ? 'ophalen' : [clean(c.street, 80), clean(c.zip, 12), clean(c.city, 50), clean(c.country, 40)].filter(Boolean).join(', ')
  };
  if (!klant.n || !/^\S+@\S+\.\S+$/.test(klant.e)) return json(400, { error: T('Vul je naam en e-mailadres in.', 'Please enter your name and email.') });
  if (ship !== 'pickup' && klant.a.length < 8) return json(400, { error: T('Vul je adres in.', 'Please enter your address.') });

  let redirectUrl = `${site}/${en ? 'en/thanks' : 'bedankt'}`;
  try { const u = new URL(body.returnUrl); if (u.origin === site) redirectUrl = u.href; } catch {}

  const summary = lines.map(l => `${l.qty}x ${l.name}`).join('; ');
  const res = await fetch('https://api.mollie.com/v2/payments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: { currency: 'EUR', value: (total / 100).toFixed(2) },
      description: `Staaf ${klant.n}: ${summary}`.slice(0, 255),
      redirectUrl,
      webhookUrl: `${site}/.netlify/functions/mollie-webhook`,
      locale: en ? 'en_US' : 'nl_NL',
      metadata: { i: meta, s: ship, k: klant, l: en ? 'en' : 'nl' } // Mollie staat max 1 KB toe
    })
  });
  const pay = await res.json();
  if (!res.ok) return json(502, { error: T('Mollie gaf een fout. Probeer het later opnieuw.', 'The payment provider returned an error. Please try again later.'), detail: pay.detail });
  if (holds.length) await setHolds(holds, pay.id);
  return json(200, { checkoutUrl: pay._links.checkout.href });
};
