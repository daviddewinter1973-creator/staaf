// Mollie meldt elke statuswijziging van een betaling.
// Betaald: verkoop vastleggen (origineel wordt verkocht, printvoorraad gaat omlaag).
// Mislukt, geannuleerd of verlopen: het origineel komt direct weer vrij.
import { recordSale, clearHolds } from './lib/state.mjs';

export default async (req) => {
  if (req.method !== 'POST') return new Response('ok');
  const form = await req.formData().catch(() => null);
  const id = form && String(form.get('id') || '');
  if (!/^tr_[A-Za-z0-9]+$/.test(id)) return new Response('ok');

  // Altijd zelf bij Mollie navragen; nooit de inhoud van het verzoek vertrouwen.
  const r = await fetch(`https://api.mollie.com/v2/payments/${id}`, {
    headers: { Authorization: `Bearer ${process.env.MOLLIE_API_KEY}` }
  });
  if (!r.ok) return new Response('ok');
  const p = await r.json();
  const items = Array.isArray(p.metadata?.i) ? p.metadata.i : [];
  const works = items.filter(i => i[0] === 'work').map(i => i[1]);
  if (p.status === 'paid') {
    await recordSale(id, items, {
      bedrag: p.amount?.value, klant: p.metadata.k, bezorging: p.metadata.s, test: p.mode === 'test'
    });
    await clearHolds(works, id);
  } else if (['failed', 'canceled', 'expired'].includes(p.status)) {
    await clearHolds(works, id);
  }
  return new Response('ok');
};
