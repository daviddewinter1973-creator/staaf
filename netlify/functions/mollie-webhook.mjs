// Mollie meldt elke statuswijziging van een betaling.
// Betaald: verkoop vastleggen (origineel wordt verkocht, printvoorraad gaat omlaag) en mails sturen.
// Mislukt, geannuleerd of verlopen: het origineel komt direct weer vrij.
import { recordSale, clearHolds, loadData, getBasis } from './lib/state.mjs';
import { sendMail, canMailCustomers, OWNER, layout, esc } from './lib/mail.mjs';

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
    const isNew = await recordSale(id, items, {
      bedrag: p.amount?.value, klant: p.metadata.k, bezorging: p.metadata.s, test: p.mode === 'test'
    });
    await clearHolds(works, id);
    // Alleen bij de eerste melding mailen, ook als Mollie de webhook vaker stuurt.
    if (isNew) await mails(new URL(req.url).origin, p, items).catch(e => console.error(e));
  } else if (['failed', 'canceled', 'expired'].includes(p.status)) {
    await clearHolds(works, id);
  }
  return new Response('ok');
};

async function mails(site, p, items) {
  const [data, basis] = await Promise.all([loadData(site), getBasis()]);
  const all = [...data.works, ...basis.extra];
  const k = p.metadata.k || {};
  const en = p.metadata.l === 'en';
  const T = (nl, e) => en ? e : nl;
  const makeLines = (en) => { const T = (nl, e) => en ? e : nl; return items.map(([kind, slug, variant, qty]) => {
    if (kind === 'work') {
      const w = all.find(x => x.slug === slug);
      const t = w ? w.title[en ? 'en' : 'nl'] : slug;
      return { txt: `${T('Origineel', 'Original')}: ${t}${w?.size ? ', ' + w.size : ''}`, qty: 1, url: `${site}/${en ? 'en/work' : 'werk'}/${slug}` };
    }
    const pr = data.prints.find(x => x.slug === slug);
    const v = pr?.variants.find(x => x.id === variant);
    const t = pr ? pr.title[en ? 'en' : 'nl'] : slug;
    return { txt: `Print: ${t}, ${v ? v.format : variant} ${v?.framed ? T('ingelijst', 'framed') : T('los', 'unframed')}`, qty, url: `${site}/${en ? 'en/' : ''}prints/${slug}` };
  }); };
  const nlLines = makeLines(false), lines = makeLines(en);
  const ship = p.metadata.s;
  const how = ship === 'pickup' ? T('Ophalen in de galerie, Bloemgracht 158', 'Collect at the gallery, Bloemgracht 158')
    : ship === 'deliver' ? T('Bezorgen, in overleg', 'Delivery, by arrangement') : T('Per post', 'By post');
  const total = '€ ' + String(p.amount.value).replace('.', ',');
  const toRows = ls => ls.map(l => [`${l.qty > 1 ? l.qty + '× ' : ''}<a href="${l.url}" style="color:#111">${esc(l.txt)}</a>`, '']);
  const rows = toRows(lines);
  const test = p.mode === 'test' ? ' [TEST]' : '';

  // 1. Melding aan Staaf
  await sendMail({
    to: OWNER(), replyTo: k.e || undefined,
    subject: `Verkocht${test}: ${nlLines.map(l => l.txt).join(', ')}`.slice(0, 180),
    html: layout({
      accent: '#ef6a1a', title: `Nieuwe bestelling${test}`, intro: `Er is betaald via de site. Beantwoord deze mail om de koper direct te mailen.`,
      rows: toRows(nlLines), totalLabel: 'Betaald', total,
      blocks: [['Koper', `${esc(k.n)}<br><a href="mailto:${esc(k.e)}">${esc(k.e)}</a>${k.t ? '<br>' + esc(k.t) : ''}`],
        ['Ontvangen', `${esc(ship === 'pickup' ? 'Ophalen in de galerie' : ship === 'deliver' ? 'Bezorgen in overleg' : 'Per post')}${k.a && k.a !== 'ophalen' ? '<br>' + esc(k.a) : ''}`],
        ['Mollie', esc(p.id)]],
      footer: `Status en voorraad zijn al bijgewerkt. Overzicht: <a href="${site}/beheer">${site}/beheer</a>`
    }),
    text: `Nieuwe bestelling${test}\n\n${nlLines.map(l => `${l.qty}x ${l.txt}`).join('\n')}\nBetaald: ${total}\n\nKoper: ${k.n}, ${k.e} ${k.t || ''}\nOntvangen: ${how}${k.a && k.a !== 'ophalen' ? ', ' + k.a : ''}\nMollie: ${p.id}`
  });

  // 2. Bevestiging aan de koper (alleen als het afzenderdomein in Resend geverifieerd is)
  if (!canMailCustomers() || !/^\S+@\S+\.\S+$/.test(k.e || '')) return;
  await sendMail({
    to: k.e, replyTo: OWNER(),
    subject: T(`Bedankt voor je bestelling bij Staaf`, `Thank you for your order from Staaf`),
    html: layout({
      accent: '#ef6a1a', title: T('Dank je wel!', 'Thank you!'),
      intro: T(`Hoi ${esc(k.n)}, je betaling is binnen. Dit heb je gekocht:`, `Hi ${esc(k.n)}, your payment has been received. This is what you bought:`),
      rows, totalLabel: T('Betaald', 'Paid'), total,
      blocks: [[T('Hoe nu verder', 'What happens next'), esc(how) + '. ' + T('We nemen binnen een paar dagen contact met je op om een moment af te spreken.', 'We will contact you within a few days to arrange a time.')]],
      footer: T('Vragen? Beantwoord gewoon deze mail of bel/app 06 55 79 02 46.<br>Galerie Staaf, Bloemgracht 158, 1015 TT Amsterdam', 'Questions? Just reply to this email or call/WhatsApp +31 6 55 79 02 46.<br>Galerie Staaf, Bloemgracht 158, 1015 TT Amsterdam')
    }),
    text: T(`Hoi ${k.n},\n\nJe betaling is binnen. Dit heb je gekocht:\n${lines.map(l => `${l.qty}x ${l.txt}`).join('\n')}\nBetaald: ${total}\n\n${how}. We nemen binnen een paar dagen contact met je op.\n\nGalerie Staaf, Bloemgracht 158, Amsterdam`,
      `Hi ${k.n},\n\nYour payment has been received. You bought:\n${lines.map(l => `${l.qty}x ${l.txt}`).join('\n')}\nPaid: ${total}\n\n${how}. We will contact you within a few days.\n\nGalerie Staaf, Bloemgracht 158, Amsterdam`)
  });
}
