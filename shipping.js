/* Verzendregels, gedeeld door de site en de betaalfunctie.
   - Ophalen in de galerie kan altijd en is gratis.
   - Losse (onomlijste) prints gaan per post, in een koker: per zending één prijs per zone.
   - Originelen en ingelijste prints worden opgehaald of in overleg bezorgd. */
(function (g) {
  function options(shipping, items) {
    var bulky = items.some(function (i) { return i.kind === 'work' || i.framed; });
    var opts = [{ id: 'pickup', price: 0 }];
    if (bulky) opts.push({ id: 'deliver', price: 0 });
    else shipping.zones.forEach(function (z) { opts.push({ id: 'post-' + z.id, zone: z.id, price: z.print }); });
    return opts;
  }
  function calc(shipping, items, id) {
    var o = options(shipping, items).filter(function (x) { return x.id === id; })[0];
    return o ? { ok: true, price: o.price } : { ok: false };
  }
  g.StaafShipping = { options: options, calc: calc };
})(typeof window !== 'undefined' ? window : globalThis);
