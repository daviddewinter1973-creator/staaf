/* Staaf: de hele site in één script. Pagina's worden vooraf opgebouwd (tools/prerender.py);
   dit script neemt het daarna over, haalt de actuele status op en regelt winkelwagen en betalen. */
(function () {
'use strict';

/* ---------- Taal ---------- */
var L = location.pathname.indexOf('/en') === 0 && (location.pathname.length === 3 || location.pathname[3] === '/') ? 'en' : 'nl';
var STR = {
  nl: {
    skip: 'Naar de inhoud', gallery: 'Galerie Staaf · Bloemgracht 158', other: 'English', cart: 'Winkelwagen',
    nav: ['Werk', 'Prints', 'In opdracht', 'Toen we daar zo zaten', 'Over Staaf'],
    heroKick: 'Galerie Staaf · Amsterdam', heroTitle: 'Schilderijen van Staaf',
    heroLede: 'Staaf is de schildersnaam van David de Winter. Sinds 2005 werkt hij in zijn atelier en galerie aan de Bloemgracht. Hieronder staat Mokum in olie: de Amsterdamse olieverfschilderijen waar hij nu aan werkt. Ouder werk in acryl vind je bij de andere reeksen.',
    seeForSale: 'Bekijk wat te koop is', allSeries: 'Alle reeksen', commission: 'Schilderij in opdracht',
    work: 'Werk', all: 'Alles', forSale: 'Te koop', sold: 'Verkocht', reserved: 'Gereserveerd', notForSale: 'Niet te koop',
    works: function (n) { return n === 1 ? '1 werk' : n + ' werken'; }, none: 'Hier staat (nog) niets. Kies een andere reeks.',
    allWorks: 'Alle werken', medium: 'Techniek', size: 'Formaat', frame: 'Lijst', frameYes: 'Zwarte houten baklijst', series: 'Reeks',
    addCart: 'In winkelwagen', inCart: 'In je winkelwagen', toCart: 'Naar winkelwagen', added: 'Toegevoegd aan je winkelwagen',
    reserve: 'Reserveren', ask: 'Stel een vraag', priceOnRequest: 'Prijs op aanvraag', held: 'Iemand rekent dit werk op dit moment af.',
    soldNote: 'Dit werk heeft een thuis. Iets vergelijkbaars, maar dan van jou?', soldCta: 'Laat een schilderij maken',
    resNote: 'Dit werk is gereserveerd. Laat je gegevens achter, dan hoor je het als het weer vrijkomt.',
    nfsNote: 'Dit werk is niet te koop.',
    printOf: 'Er is een gesigneerde print van dit werk', viewPrint: 'Bekijk de print',
    pickupNote: 'Ophalen in de galerie aan de Bloemgracht, of bezorgen in overleg. Kijken voor je koopt kan ook: stuur een berichtje.',
    askTitle: { res: 'Reserveren', q: 'Vraag over dit werk', wait: 'Hou me op de hoogte' },
    askIntro: { res: 'Je zit nergens aan vast. We nemen binnen een dag contact met je op om het te regelen.', q: 'We antwoorden meestal dezelfde dag.', wait: 'Je hoort het zodra dit werk weer vrijkomt.' },
    name: 'Naam', email: 'E-mail', phone: 'Telefoon (mag leeg)', message: 'Bericht', send: 'Versturen', sending: 'Bezig…',
    sent: 'Dank je! Je bericht is binnen, we nemen contact met je op.', sendErr: 'Versturen lukte niet. Mail of app ons gerust direct.',
    moreFrom: 'Meer uit', moreWork: 'Meer werk',
    printsKick: 'Gesigneerde fine art prints', printsTitle: 'Prints',
    printsLede: 'Drie schilderijen uit Mokum in olie als Baryta fine art print. Met de hand gesigneerd en genummerd, in een oplage van 50 per formaat, met certificaat van echtheid. Los, of op dibond in een zwarte houten lijst.',
    format: 'Formaat', finish: 'Uitvoering', loose: 'Los', framed: 'Ingelijst', framedLong: 'Op dibond, zwarte houten lijst',
    edition: 'Oplage', editionVal: '50 per formaat, gesigneerd en genummerd', paper: 'Papier', paperVal: 'Baryta fine art', left: function (n) { return 'Nog ' + n + ' van de 50'; },
    soldOut: 'Uitverkocht', from: 'vanaf', originalSold: 'Het origineel is verkocht', originalAvail: 'Het origineel is te koop', viewOriginal: 'Bekijk het origineel',
    printShip: 'Losse prints sturen we per post in een stevige koker. Ingelijste prints: ophalen of bezorgen in overleg.',
    tiles: [['Prints', 'Gesigneerde prints in een oplage van 50'], ['In opdracht', 'Jouw plek, jouw mensen, in olieverf'], ['Toen we daar zo zaten', 'Een jaar lang Amsterdamse terrassen']],
    cartTitle: 'Winkelwagen', cartEmpty: 'Je winkelwagen is leeg.', cartBrowse: 'Bekijk het werk', original: 'Origineel', print: 'Print',
    remove: 'Verwijder', subtotal: 'Subtotaal', shipping: 'Verzending', total: 'Totaal', free: 'Gratis', inOverleg: 'In overleg',
    howGet: 'Hoe wil je het ontvangen?', pickup: 'Ophalen in de galerie', pickupSub: 'Bloemgracht 158, Amsterdam. We spreken samen een moment af.',
    deliver: 'Bezorgen', deliverSub: 'Een origineel of ingelijste print brengen we zelf of laten we vervoeren. Kosten en dag spreken we na de bestelling af.',
    post: 'Per post', you: 'Jouw gegevens', street: 'Straat en huisnummer', zip: 'Postcode', city: 'Plaats', country: 'Land',
    pay: 'Afrekenen', paying: 'Even geduld…', payNote: 'Je betaalt veilig via Mollie met iDEAL, creditcard of Bancontact.',
    unavailable: 'Niet meer beschikbaar',
    thanksTitle: 'Dank je wel!', thanksText: 'Je bestelling is binnen. We nemen contact met je op over ophalen of bezorgen.',
    thanksBack: 'Terug naar het werk',
    aboutTitle: 'Over Staaf',
    about: ['Begin jaren negentig werd de kunstenaar bekend onder de naam Staaf, met een reeks schilderijen over zijn oranje alter ego, dat ook Staaf heet. Die schilderijen kwamen voort uit gebeurtenissen die hij vastlegde in een geschilderd dagboek.',
      'In de jaren daarna veranderde het werk van vorm, karakter en inhoud. De naam bleef.',
      'Tegenwoordig schildert Staaf intuïtiever. Hij houdt van het niet weten waar een schilderij heen gaat. Elke laag, vaak met een totaal ander onderwerp, laat sporen achter die samen het uiteindelijke beeld vormen. Het schilderij maakt zichzelf. Het werk is levendig, doorleefd en heeft vaak een humoristische kant.',
      'In de film- en reclamewereld kent men Staaf onder zijn eigen naam, David de Winter. Voor commercials, korte films en animaties werd hij nationaal en internationaal bekroond.',
      'Atelier en galerie Staaf zit sinds 2005 aan de Bloemgracht in het centrum van Amsterdam.'],
    visit: 'Langskomen', visitText: 'De galerie is geen winkel met vaste openingstijden. Stuur even een berichtje, dan spreken we een moment af.',
    whatsapp: 'WhatsApp', route: 'Route', directorLink: 'Werk als regisseur', commissionsLink: 'Schilderijen in opdracht'
  },
  en: {
    skip: 'Skip to content', gallery: 'Galerie Staaf · Bloemgracht 158', other: 'Nederlands', cart: 'Cart',
    nav: ['Work', 'Prints', 'Commissions', 'Toen we daar zo zaten', 'About'],
    heroKick: 'Galerie Staaf · Amsterdam', heroTitle: 'Paintings by Staaf',
    heroLede: 'Staaf is the painter name of David de Winter. Since 2005 he has worked in his studio and gallery on the Bloemgracht. Below is Mokum in oil: the Amsterdam oil paintings he is working on now. Older work in acrylic is in the other series.',
    seeForSale: 'See what is for sale', allSeries: 'All series', commission: 'Commission a painting',
    work: 'Work', all: 'All', forSale: 'For sale', sold: 'Sold', reserved: 'Reserved', notForSale: 'Not for sale',
    works: function (n) { return n === 1 ? '1 work' : n + ' works'; }, none: 'Nothing here (yet). Try another series.',
    allWorks: 'All work', medium: 'Medium', size: 'Size', frame: 'Frame', frameYes: 'Black wooden box frame', series: 'Series',
    addCart: 'Add to cart', inCart: 'In your cart', toCart: 'Go to cart', added: 'Added to your cart',
    reserve: 'Reserve', ask: 'Ask a question', priceOnRequest: 'Price on request', held: 'Someone is checking out this work right now.',
    soldNote: 'This work has found a home. Want something like it, made for you?', soldCta: 'Commission a painting',
    resNote: 'This work is reserved. Leave your details and we will let you know if it becomes available again.',
    nfsNote: 'This work is not for sale.',
    printOf: 'There is a signed print of this work', viewPrint: 'View the print',
    pickupNote: 'Collect at the gallery on the Bloemgracht, or delivery by arrangement. Want to see it first? Just send a message.',
    askTitle: { res: 'Reserve', q: 'Question about this work', wait: 'Keep me posted' },
    askIntro: { res: 'No obligation. We will get in touch within a day to arrange it.', q: 'We usually reply the same day.', wait: 'We will let you know as soon as this work becomes available.' },
    name: 'Name', email: 'Email', phone: 'Phone (optional)', message: 'Message', send: 'Send', sending: 'Sending…',
    sent: 'Thank you! Your message is in, we will be in touch.', sendErr: 'Sending failed. Feel free to email or message us directly.',
    moreFrom: 'More from', moreWork: 'More work',
    printsKick: 'Signed fine art prints', printsTitle: 'Prints',
    printsLede: 'Three paintings from Mokum in oil as Baryta fine art prints. Signed and numbered by hand, in an edition of 50 per size, with a certificate of authenticity. Unframed, or on dibond in a black wooden frame.',
    format: 'Size', finish: 'Finish', loose: 'Unframed', framed: 'Framed', framedLong: 'On dibond, black wooden frame',
    edition: 'Edition', editionVal: '50 per size, signed and numbered', paper: 'Paper', paperVal: 'Baryta fine art', left: function (n) { return n + ' of 50 left'; },
    soldOut: 'Sold out', from: 'from', originalSold: 'The original has been sold', originalAvail: 'The original is for sale', viewOriginal: 'View the original',
    printShip: 'Unframed prints are posted in a sturdy tube. Framed prints: collect at the gallery or delivery by arrangement.',
    tiles: [['Prints', 'Signed prints in an edition of 50'], ['Commissions', 'Your place, your people, in oil'], ['Toen we daar zo zaten', 'A year of Amsterdam terraces']],
    cartTitle: 'Cart', cartEmpty: 'Your cart is empty.', cartBrowse: 'See the work', original: 'Original', print: 'Print',
    remove: 'Remove', subtotal: 'Subtotal', shipping: 'Shipping', total: 'Total', free: 'Free', inOverleg: 'By arrangement',
    howGet: 'How would you like to receive it?', pickup: 'Collect at the gallery', pickupSub: 'Bloemgracht 158, Amsterdam. We will agree on a time together.',
    deliver: 'Delivery', deliverSub: 'We deliver originals and framed prints ourselves or by art transport. Cost and day are agreed after your order.',
    post: 'By post', you: 'Your details', street: 'Street and number', zip: 'Postcode', city: 'City', country: 'Country',
    pay: 'Checkout', paying: 'One moment…', payNote: 'Pay securely through Mollie with iDEAL, credit card or Bancontact.',
    unavailable: 'No longer available',
    thanksTitle: 'Thank you!', thanksText: 'Your order is in. We will contact you about collection or delivery.',
    thanksBack: 'Back to the work',
    aboutTitle: 'About Staaf',
    about: ['In the early nineties the artist became known under the name Staaf, with a series of paintings featuring his orange alter ego, also called Staaf. These paintings were inspired by events he recorded in a painted diary.',
      'In the years since, the work has changed in form, character and content. The name has stayed the same.',
      'Today Staaf paints more intuitively. He likes not knowing where a painting will lead. Each layer, often with a completely different subject, leaves traces that together form the final image. The painting creates itself. The work is lively, lived-in and often has a humorous side.',
      'In film and advertising, Staaf is known by his real name, David de Winter. His commercials, short films and animations have won awards at home and abroad.',
      'The Staaf studio and gallery has been on the Bloemgracht in the centre of Amsterdam since 2005.'],
    visit: 'Visit', visitText: 'The gallery is not a shop with fixed opening hours. Send a message and we will find a time.',
    whatsapp: 'WhatsApp', route: 'Directions', directorLink: 'Work as a director', commissionsLink: 'Commissioned paintings'
  }
};
var T = STR[L];

/* ---------- Adressen ---------- */
var PATHS = {
  nl: { home: '/', work: '/werk/', prints: '/prints', print: '/prints/', commissions: '/opdrachten', about: '/over', cart: '/winkelwagen', thanks: '/bedankt' },
  en: { home: '/en/', work: '/en/work/', prints: '/en/prints', print: '/en/prints/', commissions: '/en/commissions', about: '/en/about', cart: '/en/cart', thanks: '/en/thanks' }
};
function url(name, slug, lang) { var p = PATHS[lang || L][name]; return slug ? p + slug : p; }
function parse(path) {
  path = path.replace(/\/+$/, '') || '/';
  var P = PATHS[L];
  var keys = ['work', 'print'];
  for (var i = 0; i < keys.length; i++) {
    var pre = P[keys[i]];
    if (path.indexOf(pre) === 0 && path.length > pre.length) return { name: keys[i], slug: decodeURIComponent(path.slice(pre.length)) };
  }
  for (var k in P) if ((P[k].replace(/\/+$/, '') || '/') === path) return { name: k };
  if (path === '/en' || path === '/') return { name: 'home' };
  return { name: 'home', notfound: true };
}

/* ---------- Hulpjes ---------- */
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function eur(c) { var v = c / 100; return '€ ' + v.toLocaleString(L === 'en' ? 'en-GB' : 'nl-NL', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
function tl(o) { return o ? (o[L] || o.nl) : ''; }
var SIZES = [600, 1200, 2000];
function pic(item, n, size, isPrint) {
  var p = item.pics[n] || item.pics[0];
  var base = p.u || '/img/w/' + (isPrint ? 'print-' : '') + item.slug + '-' + n;
  return base + '-' + Math.min(size, p.max) + '.webp';
}
function srcset(item, n, isPrint) {
  var p = item.pics[n] || item.pics[0];
  return SIZES.filter(function (s) { return s <= p.max; }).map(function (s) { return pic(item, n, s, isPrint) + ' ' + s + 'w'; }).join(', ');
}
function img(item, n, sizes, opts) {
  opts = opts || {};
  var p = item.pics[n] || item.pics[0];
  var w = 600, h = Math.round(600 / p.r);
  return '<img src="' + pic(item, n, opts.src || 600, opts.print) + '" srcset="' + srcset(item, n, opts.print) + '" sizes="' + sizes + '" width="' + w + '" height="' + h + '" alt="' + esc(opts.alt || '') + '"' +
    (opts.eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"') + (opts.cls ? ' class="' + opts.cls + '"' : '') + '>';
}

/* ---------- Data ---------- */
var DATA = null, LIVE = null, WORKS = [];
function mergeLive() {
  var list = DATA.works.slice();
  if (LIVE && LIVE.extra) list = LIVE.extra.concat(list);
  WORKS = list.map(function (w) {
    var o = LIVE && LIVE.works[w.slug];
    if (!o) return w;
    var m = {}; for (var k in w) m[k] = w[k]; for (var j in o) m[j] = o[j];
    return m;
  }).filter(function (w) { return !w.hidden; });
}
function work(slug) { return WORKS.filter(function (w) { return w.slug === slug; })[0]; }
function printBy(slug) { return DATA.prints.filter(function (p) { return p.slug === slug; })[0]; }
function stock(slug, v) {
  if (LIVE && LIVE.prints) { var n = LIVE.prints[slug + '/' + v]; if (typeof n === 'number') return n; }
  var p = printBy(slug); var x = p && p.variants.filter(function (q) { return q.id === v; })[0];
  return x ? x.stock : 0;
}
function seriesName(id) { var s = DATA.series.filter(function (x) { return x.id === id; })[0]; return s ? tl(s) : id; }
function forSale(w) { return w.status === 'beschikbaar'; }

/* ---------- Winkelwagen ---------- */
var CART = [];
try { CART = JSON.parse(localStorage.getItem('staaf-cart') || '[]') || []; } catch (e) { CART = []; }
function saveCart() { try { localStorage.setItem('staaf-cart', JSON.stringify(CART)); } catch (e) {} updateCount(); }
function updateCount() {
  var n = CART.reduce(function (a, l) { return a + l.qty; }, 0), el = $('.cart-count');
  if (el) { el.textContent = n; el.hidden = !n; }
}
function inCart(kind, slug, variant) { return CART.filter(function (l) { return l.kind === kind && l.slug === slug && (kind === 'work' || l.variant === variant); })[0]; }
function addToCart(line) {
  var ex = inCart(line.kind, line.slug, line.variant);
  if (ex) { if (line.kind === 'print') ex.qty = Math.min(10, ex.qty + 1); }
  else CART.push(line);
  saveCart(); toast(T.added);
}

/* ---------- Kop en voet in de juiste taal ---------- */
function chrome() {
  document.documentElement.lang = L;
  $('.skip').textContent = T.skip;
  var tb = $('.topbar-link[data-nav="about"]'); tb.textContent = T.gallery; tb.href = url('about');
  var cl = $('.cart-link'); cl.firstChild.nodeValue = T.cart; cl.href = url('cart');
  $('.logo').href = url('home');
  var navs = $$('.nav a'), names = ['home', 'prints', 'commissions', null, 'about'];
  navs.forEach(function (a, i) { a.textContent = T.nav[i]; if (names[i]) a.href = url(names[i]); });
  $('.nav a.ext').href = DATA ? DATA.contact.twdzz : $('.nav a.ext').href;
  var lab = $$('.foot .label'); if (L === 'en' && lab.length) { lab[2].textContent = 'Follow'; }
}
function langLink(r) {
  var other = L === 'nl' ? 'en' : 'nl';
  var a = $('.lang'); a.textContent = T.other; a.lang = other; a.hreflang = other;
  var href = url(r.name, r.slug, other);
  if (r.name === 'home' && location.search) href += location.search;
  a.href = href;
}
function setNav(name) {
  var map = { work: 'home', print: 'prints', thanks: 'cart' };
  var cur = map[name] || name;
  $$('[data-nav]').forEach(function (a) { a.classList.toggle('active', a.dataset.nav === cur); });
}

/* ---------- Pagina's ---------- */
var R = {};

function card(w) {
  var state = w.status === 'verkocht' ? '<span class="tag">' + T.sold + '</span>' : w.status === 'gereserveerd' ? '<span class="tag res">' + T.reserved + '</span>' : '';
  var meta = [];
  if (w.medium) meta.push(esc(tl(w.medium)));
  if (w.size) meta.push(esc(w.size));
  var price = forSale(w) ? (w.price ? '<b>' + eur(w.price) + '</b>' : '<b>' + T.priceOnRequest + '</b>') : '';
  return '<a class="card" data-slug="' + esc(w.slug) + '" href="' + url('work', w.slug) + '"><div class="ph">' + img(w, 0, '(max-width:860px) 46vw, 22vw', { alt: tl(w.title) }) + state + '</div>' +
    '<h3>' + esc(tl(w.title)) + '</h3><p class="meta">' + meta.join(' · ') + (price ? (meta.length ? '<br>' : '') + price : '') + '</p></a>';
}

function filterState() {
  var q = new URLSearchParams(location.search);
  // Zonder keuze: Mokum in olie, het werk van nu. 'alle' toont alles.
  var reeks = q.get(L === 'en' ? 'series' : 'reeks') || DATA.series[0].id;
  var st = q.get('status') || '';
  if (!DATA.series.some(function (s) { return s.id === reeks; })) reeks = '';
  if (['te-koop', 'verkocht', 'for-sale', 'sold'].indexOf(st) < 0) st = '';
  return { reeks: reeks, status: st === 'for-sale' ? 'te-koop' : st === 'sold' ? 'verkocht' : st };
}
function filterHref(reeks, status) {
  var q = [];
  if (reeks !== DATA.series[0].id) q.push((L === 'en' ? 'series=' : 'reeks=') + (reeks || (L === 'en' ? 'all' : 'alle')));
  if (status) q.push('status=' + (L === 'en' ? (status === 'te-koop' ? 'for-sale' : 'sold') : status));
  return url('home') + (q.length ? '?' + q.join('&') : '') + '#werk';
}

R.home = function () {
  var f = filterState();
  var feat = work(DATA.featured) || WORKS.filter(forSale)[0] || WORKS[0];
  var list = WORKS.filter(function (w) {
    if (f.reeks && w.series.indexOf(f.reeks) < 0) return false;
    if (f.status === 'te-koop' && !forSale(w)) return false;
    if (f.status === 'verkocht' && w.status !== 'verkocht') return false;
    return true;
  });
  if (!f.status) list.sort(function (a, b) { return (forSale(b) ? 1 : 0) - (forSale(a) ? 1 : 0); });
  var ser = DATA.series.filter(function (s) { return s.id === f.reeks; })[0];
  var sl = '<div class="filters" role="group" aria-label="' + T.series + '">' +
    DATA.series.map(function (s) { return '<a href="' + filterHref(s.id, f.status) + '"' + (f.reeks === s.id ? ' class="on" aria-current="true"' : '') + '>' + esc(tl(s)) + '</a>'; }).join('') +
    '<a href="' + filterHref('', f.status) + '"' + (!f.reeks ? ' class="on" aria-current="true"' : '') + '>' + T.allSeries + '</a></div>';
  var st = '<div class="filters" role="group" aria-label="Status">' +
    [['', T.all], ['te-koop', T.forSale], ['verkocht', T.sold]].map(function (x) {
      return '<a href="' + filterHref(f.reeks, x[0]) + '"' + (f.status === x[0] ? ' class="on" aria-current="true"' : '') + '>' + x[1] + '</a>';
    }).join('') + '</div>';
  var tiles = [
    ['prints', url('prints'), '/img/w/print-' + DATA.prints[0].slug + '-0-1200.webp'],
    ['commissions', url('commissions'), '/img/opdracht/c01.webp'],
    ['twdzz', DATA.contact.twdzz, '/img/twdzz.webp']
  ];
  return '<section class="hero">' +
      '<div><p class="kicker">' + T.heroKick + '</p><h1 class="display">' + T.heroTitle + '</h1><p class="lede">' + T.heroLede + '</p>' +
      '<div class="links"><a class="textlink" href="' + filterHref(DATA.series[0].id, 'te-koop') + '">' + T.seeForSale + '</a><a class="textlink" href="' + url('commissions') + '">' + T.commission + '</a></div></div>' +
      '<figure class="hero-art"><a href="' + url('work', feat.slug) + '">' + img(feat, 0, '(max-width:860px) 90vw, 50vw', { alt: tl(feat.title), eager: true, src: 1200 }) + '</a>' +
      '<figcaption><a href="' + url('work', feat.slug) + '">' + esc(tl(feat.title)) + '</a>' + (feat.size ? ', ' + esc(feat.size) : '') + (forSale(feat) && feat.price ? '. ' + eur(feat.price) : '') + '</figcaption></figure>' +
    '</section>' +
    '<div class="section-head" id="werk"><div class="row"><h2 class="h2">' + (ser ? esc(tl(ser)) : T.work) + '</h2><span class="count">' + T.works(list.length) + '</span></div>' +
      '<div class="filterbar">' + sl + st + '</div></div>' +
    (ser && ser.intro ? '<p class="series-intro">' + esc(tl(ser.intro)) + '</p>' : '') +
    (list.length ? '<div class="grid">' + list.map(card).join('') + '</div>' : '<p class="empty">' + T.none + '</p>') +
    '<section class="tiles">' + tiles.map(function (t, i) {
      return '<a class="tile" href="' + t[1] + '"><div class="ph"><img src="' + t[2] + '" alt="" loading="lazy" width="600" height="450"></div><h3 class="h3">' + T.tiles[i][0] + (i === 2 ? ' ↗' : '') + '</h3><p>' + T.tiles[i][1] + '</p></a>';
    }).join('') + '</section>';
};

function buyBox(w) {
  var h = '';
  var p = DATA.prints.filter(function (x) { return x.slug === w.slug; })[0];
  if (forSale(w)) {
    h += w.price ? '<p class="price">' + eur(w.price) + '</p>' : '<p class="price">' + T.priceOnRequest + '</p>';
    var c = inCart('work', w.slug);
    h += '<div class="buttons">';
    if (w.price && !w.held) h += c ? '<a class="btn wide" href="' + url('cart') + '">' + T.inCart + ' →</a>' : '<button class="btn wide" data-buy="' + esc(w.slug) + '">' + T.addCart + '</button>';
    h += '<button class="btn outline wide" data-ask="res">' + T.reserve + '</button>';
    h += '<button class="btn outline wide" data-ask="q">' + T.ask + '</button></div>';
    if (w.held) h += '<p class="note">' + T.held + '</p>';
    h += '<p class="note">' + T.pickupNote + '</p>';
  } else if (w.status === 'gereserveerd') {
    h += '<p class="state res">' + T.reserved + '</p><p class="note" style="margin:0 0 16px">' + T.resNote + '</p><div class="buttons"><button class="btn outline wide" data-ask="wait">' + T.askTitle.wait + '</button></div>';
  } else if (w.status === 'niet te koop') {
    h += '<p class="state sold">' + T.notForSale + '</p><div class="buttons"><button class="btn outline wide" data-ask="q">' + T.ask + '</button></div>';
  } else {
    h += '<p class="state sold">' + T.sold + '</p><p class="note" style="margin:0 0 16px">' + T.soldNote + '</p><div class="buttons"><a class="btn wide" href="' + url('commissions') + '">' + T.soldCta + '</a></div>';
  }
  if (p) h += '<p class="note">' + T.printOf + ': <a href="' + url('print', p.slug) + '">' + T.viewPrint + '</a>.</p>';
  h += '<div id="ask"></div>';
  return h;
}

R.work = function (r) {
  var w = work(r.slug);
  if (!w) return null;
  var views = w.pics.length > 1 ? '<div class="views">' + w.pics.map(function (p, i) {
    return '<button type="button" data-view="' + i + '"' + (i ? '' : ' class="on" aria-current="true"') + ' aria-label="' + (i + 1) + '/' + w.pics.length + '"><img src="' + pic(w, i, 600) + '" alt="" loading="lazy" width="72" height="72"></button>';
  }).join('') + '</div>' : '';
  var alt = L === 'nl' ? w.title.en : w.title.nl;
  var specs = [];
  if (w.medium) specs.push([T.medium, esc(tl(w.medium))]);
  if (w.size) specs.push([T.size, esc(w.size)]);
  if (w.frame) specs.push([T.frame, T.frameYes]);
  if (w.series && w.series.length) specs.push([T.series, w.series.map(function (s) { return '<a href="' + filterHref(s, '') + '">' + esc(seriesName(s)) + '</a>'; }).join(', ')]);
  var more = WORKS.filter(function (x) { return x.slug !== w.slug && x.series[0] === w.series[0]; });
  more.sort(function (a, b) { return (forSale(b) ? 1 : 0) - (forSale(a) ? 1 : 0); });
  more = more.slice(0, 4);
  return '<a class="crumb" href="' + (w.series[0] ? filterHref(w.series[0], '') : url('home')) + '">← ' + esc(w.series[0] ? seriesName(w.series[0]) : T.allWorks) + '</a>' +
    '<div class="product"><figure class="stage"><div class="wall">' + img(w, 0, '(max-width:860px) 92vw, 54vw', { alt: tl(w.title), eager: true, src: 1200, cls: 'main' }) + '</div>' + views + '</figure>' +
    '<div class="info"><p class="kicker">' + esc(w.series[0] ? seriesName(w.series[0]) : '') + '</p><h1 class="display">' + esc(tl(w.title)) + '</h1>' +
      (alt && alt !== tl(w.title) ? '<p class="sub" lang="' + (L === 'nl' ? 'en' : 'nl') + '">' + esc(alt) + '</p>' : '<p class="sub"></p>') +
      (w.note && tl(w.note) ? '<div class="prose" style="margin-bottom:22px"><p>' + esc(tl(w.note)).replace(/\n+/g, '</p><p>') + '</p></div>' : '') +
      (specs.length ? '<dl class="specs">' + specs.map(function (s) { return '<div><dt>' + s[0] + '</dt><dd>' + s[1] + '</dd></div>'; }).join('') + '</dl>' : '') +
      '<div id="buy">' + buyBox(w) + '</div></div></div>' +
    (more.length ? '<section class="more"><div class="section-head"><div class="row"><h2 class="h2">' + T.moreFrom + ' ' + esc(seriesName(w.series[0])) + '</h2><a class="textlink" href="' + filterHref(w.series[0], '') + '">' + T.allWorks + '</a></div></div><div class="grid">' + more.map(card).join('') + '</div></section>' : '');
};

R.prints = function () {
  return '<section class="hero" style="margin-bottom:56px"><div><p class="kicker">' + T.printsKick + '</p><h1 class="display">' + T.printsTitle + '</h1><p class="lede">' + T.printsLede + '</p></div><div></div></section>' +
    '<div class="grid" style="grid-template-columns:repeat(3,1fr)">' + DATA.prints.map(function (p) {
      var min = Math.min.apply(null, p.variants.map(function (v) { return v.price; }));
      var out = p.variants.every(function (v) { return stock(p.slug, v.id) <= 0; });
      return '<a class="card" href="' + url('print', p.slug) + '"><div class="ph">' + img(p, 0, '(max-width:860px) 46vw, 30vw', { alt: tl(p.title), print: true, src: 1200 }) + (out ? '<span class="tag">' + T.soldOut + '</span>' : '') + '</div>' +
        '<h3>' + esc(tl(p.title)) + '</h3><p class="meta">Baryta fine art · A3, A2, A1<br><b>' + T.from + ' ' + eur(min) + '</b></p></a>';
    }).join('') + '</div>';
};

var PSEL = {};
function printBuy(p) {
  var sel = PSEL[p.slug] || (PSEL[p.slug] = { format: p.variants[0].format, framed: false });
  var formats = [];
  p.variants.forEach(function (v) { if (formats.indexOf(v.format) < 0) formats.push(v.format); });
  var v = p.variants.filter(function (x) { return x.format === sel.format && x.framed === sel.framed; })[0];
  var left = stock(p.slug, v.id);
  var h = '<fieldset class="opts"><legend class="label">' + T.format + '</legend><div class="optrow">' + formats.map(function (f) {
    var any = p.variants.filter(function (x) { return x.format === f; })[0];
    return '<label class="opt"><input type="radio" name="fmt" value="' + f + '"' + (f === sel.format ? ' checked' : '') + '><span>' + f + '<small>' + esc(any.dims) + '</small></span></label>';
  }).join('') + '</div></fieldset>';
  h += '<fieldset class="opts"><legend class="label">' + T.finish + '</legend><div class="optrow two">' + [false, true].map(function (fr) {
    var x = p.variants.filter(function (y) { return y.format === sel.format && y.framed === fr; })[0];
    return '<label class="opt"><input type="radio" name="fin" value="' + (fr ? 1 : 0) + '"' + (fr === sel.framed ? ' checked' : '') + '><span>' + (fr ? T.framed : T.loose) + '<small>' + eur(x.price) + '</small></span></label>';
  }).join('') + '</div></fieldset>';
  h += '<p class="price">' + eur(v.price) + '</p>';
  if (left <= 0) h += '<p class="state sold">' + T.soldOut + '</p>';
  else if (left <= 10) h += '<p class="scarcity">' + T.left(left) + '</p>';
  h += '<div class="buttons"><button class="btn wide" data-buyprint="' + esc(v.id) + '"' + (left <= 0 ? ' disabled' : '') + '>' + T.addCart + '</button></div>';
  h += '<p class="note">' + (sel.framed ? T.framedLong + '. ' : '') + T.printShip + '</p>';
  return h;
}

R.print = function (r) {
  var p = printBy(r.slug);
  if (!p) return null;
  var orig = work(p.slug);
  var specs = [[T.paper, T.paperVal], [T.edition, T.editionVal]];
  return '<a class="crumb" href="' + url('prints') + '">← ' + T.printsTitle + '</a>' +
    '<div class="product"><figure class="stage"><div class="wall">' + img(p, 0, '(max-width:860px) 92vw, 54vw', { alt: tl(p.title), eager: true, src: 1200, cls: 'main', print: true }) + '</div></figure>' +
    '<div class="info"><p class="kicker">' + T.printsKick + '</p><h1 class="display">' + esc(tl(p.title)) + '</h1>' +
    '<p class="sub">Mokum in olie</p>' +
    '<dl class="specs">' + specs.map(function (s) { return '<div><dt>' + s[0] + '</dt><dd>' + s[1] + '</dd></div>'; }).join('') + '</dl>' +
    '<div id="buy" data-print="' + esc(p.slug) + '">' + printBuy(p) + '</div>' +
    (orig ? '<p class="note">' + (forSale(orig) ? T.originalAvail : T.originalSold) + ': <a href="' + url('work', orig.slug) + '">' + T.viewOriginal + '</a>.</p>' : '') +
    '</div></div>';
};

var COM = {
  nl: {
    kick: 'Schilderijen in opdracht', title: 'Jouw verhaal, in olieverf',
    lede: 'Een persoonlijk olieverfschilderij, op maat geschilderd in het atelier aan de Bloemgracht. Van een stadsgezicht of je voordeur tot een stilleven met dingen die ertoe doen, of een portret van iemand die je lief is.',
    start: 'Begin je opdracht', how: 'Van idee tot doek',
    steps: [['Jij vertelt', 'We beginnen bij jouw verhaal, herinnering of favoriete plek.'], ['Samen een plan', 'We bepalen compositie, formaat en sfeer.'], ['Verzamelen', 'Voorwerpen en beelden, of we bezoeken samen die ene plek.'], ['Schetsen en fotograferen', 'Ik leg vast wat het verhaal compleet maakt.'], ['Schilderen', 'Met de hand, in olieverf, in mijn atelier.']],
    portrait: 'Ook portretten', portraitText: 'Een geliefde, een kind, een ouder of de hond die bij de familie hoort. Een geschilderd portret is intiemer dan welke foto ook en blijft generaties in huis. Vanaf een dierbare foto, of ik zit zelf even tegenover het model. Allebei kan.',
    prices: 'Richtprijzen', pricesText: 'Elke opdracht is anders, dus je krijgt vooraf een persoonlijke offerte. Deze prijzen zijn een eerlijk startpunt.',
    tiers: [['Klein', 'ca. 30 × 40 cm', 85000], ['Medium', 'ca. 40 × 50 cm', 125000], ['Groot', 'ca. 50 × 70 cm', 185000], ['Extra groot', 'ca. 60 × 80 cm', 265000], ['XXL', 'ca. 80 × 100 cm', 350000], ['Op aanvraag', 'groter of complex', 400000]],
    incl: ['Intakegesprek, ontwerp van de compositie en het schilderwerk in olieverf op doek', 'Extra persoon of dier: + € 300', 'Locatiebezoek in Amsterdam: vanaf Groot inbegrepen', 'Inlijsting: op offerte', 'Aanbetaling 50%, levertijd 6 tot 10 weken'],
    quote: 'Met een persoonlijk schilderij geef je meer dan kunst. Je geeft herinnering, verbinding en liefde.',
    formTitle: 'Vertel wat je voor ogen hebt', formText: 'Eén bericht is genoeg. Foto’s van je plek of dierbare stuur je daarna gewoon mee.',
    what: 'Wat heb je in gedachten?', whatOpts: ['Stilleven met een verhaal', 'Portret (mens)', 'Portret (huisdier)', 'Stadsgezicht of favoriete plek', 'Huis of voordeur', 'Weet ik nog niet, denk graag mee'],
    fmt: 'Formaat', fmtOpts: ['Nog geen idee', 'Klein (ca. 30 × 40)', 'Medium (ca. 40 × 50)', 'Groot (ca. 50 × 70)', 'Extra groot (ca. 60 × 80)', 'XXL (ca. 80 × 100)'],
    story: 'Jouw verhaal of wens', viaWa: 'Verstuur via WhatsApp', viaMail: 'Verstuur via e-mail', direct: 'Liever direct contact?',
    msg: function (n, w, f, s) { return 'Hoi Staaf, ik ben ' + n + '.\nIk denk aan: ' + w + '\nFormaat: ' + f + '\n\n' + s; }
  },
  en: {
    kick: 'Commissioned paintings', title: 'Your story, in oil',
    lede: 'A personal oil painting, made to measure in the studio on the Bloemgracht. A cityscape or your front door, a still life of things that matter, or a portrait of someone you love.',
    start: 'Start your commission', how: 'From idea to canvas',
    steps: [['You tell me', 'We start with your story, memory or favourite place.'], ['A plan together', 'We decide on composition, size and mood.'], ['Gathering', 'Objects and images, or we visit that one place together.'], ['Sketches and photos', 'I capture what makes the story complete.'], ['Painting', 'By hand, in oil, in my studio.']],
    portrait: 'Portraits too', portraitText: 'A loved one, a child, a parent or the dog who is part of the family. A painted portrait is more intimate than any photo and stays in the family for generations. From a cherished photo, or with the sitter in front of me. Both work.',
    prices: 'Guide prices', pricesText: 'Every commission is different, so you get a personal quote first. These prices are an honest starting point.',
    tiers: [['Small', 'approx. 30 × 40 cm', 85000], ['Medium', 'approx. 40 × 50 cm', 125000], ['Large', 'approx. 50 × 70 cm', 185000], ['Extra large', 'approx. 60 × 80 cm', 265000], ['XXL', 'approx. 80 × 100 cm', 350000], ['On request', 'larger or complex', 400000]],
    incl: ['Intake conversation, design of the composition and the painting in oil on canvas', 'Extra person or animal: + € 300', 'Location visit in Amsterdam: included from Large', 'Framing: on quotation', '50% deposit, delivery in 6 to 10 weeks'],
    quote: 'A personal painting is more than art. It is memory, connection and love.',
    formTitle: 'Tell me what you have in mind', formText: 'One message is enough. You can send photos of your place or loved one afterwards.',
    what: 'What do you have in mind?', whatOpts: ['A still life with a story', 'Portrait (person)', 'Portrait (pet)', 'Cityscape or favourite place', 'House or front door', 'Not sure yet, happy to brainstorm'],
    fmt: 'Size', fmtOpts: ['No idea yet', 'Small (approx. 30 × 40)', 'Medium (approx. 40 × 50)', 'Large (approx. 50 × 70)', 'Extra large (approx. 60 × 80)', 'XXL (approx. 80 × 100)'],
    story: 'Your story or wish', viaWa: 'Send via WhatsApp', viaMail: 'Send by email', direct: 'Rather get in touch directly?',
    msg: function (n, w, f, s) { return 'Hi Staaf, my name is ' + n + '.\nI am thinking of: ' + w + '\nSize: ' + f + '\n\n' + s; }
  }
};

R.commissions = function () {
  var C = COM[L], c = DATA.contact;
  var imgs = ['c00', 'c02', 'c03', 'c04', 'c05'];
  return '<section class="hero"><div><img class="seal" src="/img/opdracht/zegel.webp" width="360" height="366" alt="Commissions by Staaf"><p class="kicker">' + C.kick + '</p><h1 class="display">' + C.title + '</h1><p class="lede">' + C.lede + '</p>' +
      '<div class="links"><a class="btn" href="#begin">' + C.start + '</a></div></div>' +
      '<figure class="hero-art"><img src="/img/opdracht/c01.webp" width="1100" height="786" alt="" fetchpriority="high"></figure></section>' +
    '<div class="section-head"><div class="row"><h2 class="h2">' + C.how + '</h2></div></div>' +
    '<ol class="steps">' + C.steps.map(function (s) { return '<li><b>' + s[0] + '</b>' + s[1] + '</li>'; }).join('') + '</ol>' +
    '<div class="strip">' + imgs.map(function (n) { return '<img src="/img/opdracht/' + n + '.webp" alt="" loading="lazy" width="600" height="800">'; }).join('') + '</div>' +
    '<div class="split"><div><h2 class="h2">' + C.portrait + '</h2><div class="prose"><p>' + C.portraitText + '</p></div></div>' +
      '<div><h2 class="h2">' + C.prices + '</h2><p style="margin:0;font-size:17px">' + C.pricesText + '</p>' +
      '<div class="prices">' + C.tiers.map(function (t) { return '<div><b>' + t[0] + '</b><span>' + t[1] + '</span><strong><small>' + T.from + '</small>' + eur(t[2]) + '</strong></div>'; }).join('') + '</div>' +
      '<ul class="ticks">' + C.incl.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div></div>' +
    '<blockquote class="quote">' + C.quote + '</blockquote>' +
    '<section class="split block" id="begin"><div><h2 class="h2">' + C.formTitle + '</h2><p class="lede">' + C.formText + '</p>' +
      '<p class="label" style="margin-top:34px">' + C.direct + '</p><p style="margin:0"><a href="' + c.whatsapp + '">WhatsApp ' + c.phone + '</a><br><a href="mailto:' + c.commissions + '">' + c.commissions + '</a><br><a href="' + c.instagram + '">@commissions_by_staaf</a></p></div>' +
      '<form class="ask" id="comform" style="margin:0"><label class="field"><span>' + T.name + '</span><input name="naam" required autocomplete="name"></label>' +
      '<label class="field"><span>' + C.what + '</span><select name="wat">' + C.whatOpts.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select></label>' +
      '<label class="field"><span>' + C.fmt + '</span><select name="formaat">' + C.fmtOpts.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select></label>' +
      '<label class="field"><span>' + C.story + '</span><textarea name="verhaal"></textarea></label>' +
      '<div class="buttons"><button class="btn wide" type="submit" value="wa">' + C.viaWa + '</button><button class="btn outline wide" type="submit" value="mail">' + C.viaMail + '</button></div></form></section>';
};

R.about = function () {
  var c = DATA.contact;
  return '<div class="split over"><div><p class="kicker">Staaf · David de Winter</p><h1 class="display">' + T.aboutTitle + '</h1><div class="prose">' + T.about.map(function (p) { return '<p>' + p + '</p>'; }).join('') + '</div>' +
      '<div class="links" style="margin-top:28px"><a class="textlink" href="' + url('commissions') + '">' + T.commissionsLink + '</a><a class="textlink" href="https://www.daviddewinter.nl">' + T.directorLink + ' ↗</a></div></div>' +
      '<figure class="portrait"><img src="/img/david.webp" width="525" height="820" alt="' + (L === 'en' ? 'David de Winter, alias Staaf' : 'David de Winter, alias Staaf') + '" fetchpriority="high"></figure></div>' +
    '<section class="split block mid"><div class="facts"><h2 class="h2">' + T.visit + '</h2><p class="lede">' + T.visitText + '</p>' +
      '<p><span class="label">Galerie Staaf</span><br>' + c.address.join('<br>') + '</p>' +
      '<p><span class="label">Contact</span><br><a href="mailto:' + c.email + '">' + c.email + '</a><br><a href="tel:' + c.tel + '">' + c.phone + '</a> · <a href="' + c.whatsapp + '">' + T.whatsapp + '</a></p>' +
      '<p><a class="textlink" href="https://www.google.com/maps/dir/?api=1&destination=Bloemgracht+158+Amsterdam">' + T.route + ' ↗</a></p></div>' +
      '<div class="map"><iframe title="Bloemgracht 158" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=4.8775%2C52.3735%2C4.8875%2C52.3775&amp;layer=mapnik&amp;marker=52.37552%2C4.88250"></iframe></div></section>';
};

R.cart = function () {
  if (!CART.length) return '<h1 class="display">' + T.cartTitle + '</h1><p class="lede">' + T.cartEmpty + '</p><a class="btn" href="' + url('home') + '">' + T.cartBrowse + '</a>';
  return '<h1 class="display">' + T.cartTitle + '</h1><div class="cart"><div id="lines"></div><div class="sum" id="sum"></div></div>';
};

R.thanks = function () {
  CART = []; saveCart();
  return '<div style="max-width:40em"><p class="kicker">Galerie Staaf</p><h1 class="display">' + T.thanksTitle + '</h1><p class="lede">' + T.thanksText + '</p><a class="btn" href="' + url('home') + '">' + T.thanksBack + '</a></div>';
};

/* ---------- Winkelwagen-details ---------- */
function cartLines() {
  return CART.map(function (l, i) {
    if (l.kind === 'work') {
      var w = work(l.slug);
      if (!w) return null;
      return { i: i, l: l, item: w, title: tl(w.title), sub: T.original + (w.size ? ' · ' + w.size : ''), price: w.price, ok: forSale(w) && !!w.price && !w.held, href: url('work', w.slug), kind: 'work' };
    }
    var p = printBy(l.slug), v = p && p.variants.filter(function (x) { return x.id === l.variant; })[0];
    if (!v) return null;
    return { i: i, l: l, item: p, print: true, title: tl(p.title), sub: T.print + ' ' + v.format + ' · ' + (v.framed ? T.framed : T.loose), price: v.price, ok: stock(p.slug, v.id) >= l.qty, href: url('print', p.slug), kind: 'print', framed: v.framed };
  }).filter(Boolean);
}
var SHIP = null;
function drawCart() {
  var box = $('#lines'); if (!box) return;
  var lines = cartLines();
  box.innerHTML = lines.map(function (x) {
    return '<div class="line"><a class="thumb" href="' + x.href + '"><img src="' + pic(x.item, 0, 600, x.print) + '" alt="" width="80" height="80"></a><div><h3><a href="' + x.href + '" style="text-decoration:none">' + esc(x.title) + '</a></h3><p>' + esc(x.sub) + '</p>' +
      (x.ok ? '' : '<p style="color:#b00020">' + T.unavailable + '</p>') +
      (x.kind === 'print' ? '<span class="qty"><button type="button" data-q="-1" data-i="' + x.i + '" aria-label="-">−</button><span>' + x.l.qty + '</span><button type="button" data-q="1" data-i="' + x.i + '" aria-label="+">+</button></span> ' : '') +
      '<br><button class="rm" type="button" data-rm="' + x.i + '">' + T.remove + '</button></div><div class="amt">' + (x.price ? eur(x.price * x.l.qty) : '') + '</div></div>';
  }).join('');
  var items = lines.map(function (x) { return { kind: x.kind, framed: x.framed }; });
  var opts = window.StaafShipping.options(DATA.shipping, items);
  if (!SHIP || !opts.some(function (o) { return o.id === SHIP; })) SHIP = opts[0].id;
  var sub = lines.reduce(function (a, x) { return a + (x.price || 0) * x.l.qty; }, 0);
  var sh = opts.filter(function (o) { return o.id === SHIP; })[0];
  var allOk = lines.every(function (x) { return x.ok; });
  var zoneName = function (z) { var o = DATA.shipping.zones.filter(function (q) { return q.id === z; })[0]; return o ? tl(o) : z; };
  var sum = $('#sum');
  var keep = {}; $$('input', sum).forEach(function (i) { keep[i.name] = i.value; });
  sum.innerHTML = '<p class="label">' + T.howGet + '</p><div class="ship">' + opts.map(function (o) {
    var name = o.id === 'pickup' ? T.pickup : o.id === 'deliver' ? T.deliver : T.post + ', ' + zoneName(o.zone);
    var small = o.id === 'pickup' ? T.pickupSub : o.id === 'deliver' ? T.deliverSub : '';
    var price = o.id === 'deliver' ? T.inOverleg : o.price ? eur(o.price) : T.free;
    return '<label><input type="radio" name="ship" value="' + o.id + '"' + (o.id === SHIP ? ' checked' : '') + '><span>' + name + (small ? '<small>' + small + '</small>' : '') + '</span><b>' + price + '</b></label>';
  }).join('') + '</div>' +
  '<div class="rows"><div><span>' + T.subtotal + '</span><span>' + eur(sub) + '</span></div><div><span>' + T.shipping + '</span><span>' + (SHIP === 'deliver' ? T.inOverleg : sh.price ? eur(sh.price) : T.free) + '</span></div><div class="tot"><span>' + T.total + '</span><span>' + eur(sub + sh.price) + '</span></div></div>' +
  '<form id="payform" style="margin-top:24px"><p class="label">' + T.you + '</p>' +
    '<label class="field"><span>' + T.name + '</span><input name="name" required autocomplete="name"></label>' +
    '<div class="two"><label class="field"><span>' + T.email + '</span><input name="email" type="email" required autocomplete="email"></label>' +
    '<label class="field"><span>' + T.phone + '</span><input name="phone" type="tel" autocomplete="tel"></label></div>' +
    (SHIP === 'pickup' ? '' : '<label class="field"><span>' + T.street + '</span><input name="street" required autocomplete="street-address"></label><div class="two"><label class="field"><span>' + T.zip + '</span><input name="zip" required autocomplete="postal-code"></label><label class="field"><span>' + T.city + '</span><input name="city" required autocomplete="address-level2"></label></div>' +
      (SHIP === 'post-nl' || SHIP === 'deliver' ? '' : '<label class="field"><span>' + T.country + '</span><input name="country" required autocomplete="country-name"></label>')) +
    '<button class="btn wide" type="submit"' + (allOk ? '' : ' disabled') + '>' + T.pay + ' · ' + eur(sub + sh.price) + '</button><p class="note">' + T.payNote + '</p><p class="msg err" id="payerr" hidden></p></form>';
  $$('input', sum).forEach(function (i) { if (keep[i.name] && i.type !== 'radio') i.value = keep[i.name]; });
}

/* ---------- Reserveren / vraag ---------- */
function askForm(kind, w) {
  return '<form class="ask" id="askform"><p class="h3">' + T.askTitle[kind] + '</p><p class="note" style="margin:0 0 16px">' + T.askIntro[kind] + '</p>' +
    '<input type="hidden" name="soort" value="' + kind + '"><input type="hidden" name="werk" value="' + esc(w.title.nl + ' (' + w.slug + ')') + '">' +
    '<p hidden><input name="bot"></p>' +
    '<label class="field"><span>' + T.name + '</span><input name="naam" required autocomplete="name"></label>' +
    '<label class="field"><span>' + T.email + '</span><input name="email" type="email" required autocomplete="email"></label>' +
    '<label class="field"><span>' + T.phone + '</span><input name="telefoon" type="tel" autocomplete="tel"></label>' +
    '<label class="field"><span>' + T.message + '</span><textarea name="bericht"></textarea></label>' +
    '<button class="btn wide" type="submit">' + T.send + '</button><p class="msg" id="askmsg" hidden></p></form>';
}

/* ---------- Toast en lightbox ---------- */
var toastT;
function toast(msg) {
  var t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.innerHTML = esc(msg) + ' <a href="' + url('cart') + '">' + T.toCart + ' →</a>'; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 4200);
}
function lightbox(item, n, isPrint) {
  var lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
  var many = item.pics.length > 1;
  function show() { lb.querySelector('img').src = pic(item, n, 2000, isPrint); }
  lb.innerHTML = '<img alt="' + esc(tl(item.title)) + '"><button class="x" type="button">' + (L === 'en' ? 'Close' : 'Sluiten') + ' ✕</button>' + (many ? '<button class="prev" type="button" aria-label="Vorige">‹</button><button class="next" type="button" aria-label="Volgende">›</button>' : '');
  document.body.appendChild(lb); show();
  var close = function () { lb.remove(); document.removeEventListener('keydown', key); };
  var step = function (d) { n = (n + d + item.pics.length) % item.pics.length; show(); };
  var key = function (e) { if (e.key === 'Escape') close(); if (many && e.key === 'ArrowRight') step(1); if (many && e.key === 'ArrowLeft') step(-1); };
  document.addEventListener('keydown', key);
  lb.addEventListener('click', function (e) {
    if (e.target.classList.contains('prev')) return step(-1);
    if (e.target.classList.contains('next')) return step(1);
    close();
  });
  lb.querySelector('.x').focus();
}

/* ---------- Tekenen ---------- */
var ROUTE = null;
function render(opts) {
  opts = opts || {};
  var r = parse(location.pathname);
  ROUTE = r;
  var html = R[r.name] ? R[r.name](r) : null;
  if (html == null) { r = { name: 'home', notfound: true }; html = R.home(r); }
  var main = $('#view');
  main.innerHTML = html;
  main.dataset.route = r.name + (r.slug ? ':' + r.slug : '');
  setNav(r.name); langLink(r); updateCount();
  document.title = titleFor(r);
  if (r.name === 'cart') drawCart();
  if (!opts.keepScroll) {
    if (location.hash && $(location.hash)) $(location.hash).scrollIntoView();
    else window.scrollTo(0, 0);
  }
}
function titleFor(r) {
  var base = 'Staaf';
  if (r.name === 'work') { var w = work(r.slug); if (w) return tl(w.title) + ' · ' + base; }
  if (r.name === 'print') { var p = printBy(r.slug); if (p) return 'Print ' + tl(p.title) + ' · ' + base; }
  var names = { home: L === 'en' ? 'Paintings from Amsterdam' : 'Schilderijen uit Amsterdam', prints: T.printsTitle, commissions: COM[L].kick, about: T.aboutTitle, cart: T.cartTitle, thanks: T.thanksTitle };
  return r.name === 'home' ? base + ' · ' + names.home : names[r.name] + ' · ' + base;
}

// Alleen de onderdelen bijwerken die van de actuele status afhangen, zodat de
// vooraf opgebouwde pagina (en het grote beeld) blijft staan.
function refreshLive() {
  var r = ROUTE;
  if (r.name === 'home') {
    var key = $('#view').innerHTML;
    var fresh = R.home(r);
    if (fresh !== key) {
      // alleen het raster en de teller verversen
      var tmp = document.createElement('div'); tmp.innerHTML = fresh;
      ['.grid', '.count', '.empty'].forEach(function (s) { var a = $(s, $('#view')), b = $(s, tmp); if (a && b && a.outerHTML !== b.outerHTML) a.outerHTML = b.outerHTML; });
    }
  } else if (r.name === 'work') {
    var w = work(r.slug), buy = $('#buy');
    if (w && buy && !$('#askform')) buy.innerHTML = buyBox(w);
  } else if (r.name === 'print') {
    var p = printBy(r.slug), b2 = $('#buy');
    if (p && b2) b2.innerHTML = printBuy(p);
  } else if (r.name === 'cart') drawCart();
}

/* ---------- Gebeurtenissen ---------- */
document.addEventListener('click', function (e) {
  var a = e.target.closest('a');
  if (a && a.origin === location.origin && !a.target && !e.metaKey && !e.ctrlKey && !e.shiftKey && !a.hasAttribute('download') && a.pathname.indexOf('/img/') !== 0 && a.pathname !== '/beheer') {
    var toLang = a.pathname.indexOf('/en') === 0 && (a.pathname.length === 3 || a.pathname[3] === '/') ? 'en' : 'nl';
    if (toLang !== L) return; // taalwissel: gewoon de pagina laden
    if (a.pathname === location.pathname && a.search === location.search && a.hash) return;
    e.preventDefault();
    var same = a.pathname === location.pathname;
    history.pushState(null, '', a.pathname + a.search + a.hash);
    render({ keepScroll: same && a.hash });
    if (same && a.hash && $(a.hash)) $(a.hash).scrollIntoView();
    $('#view').focus({ preventScroll: true });
    return;
  }
  var b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.buy) { addToCart({ kind: 'work', slug: b.dataset.buy, qty: 1 }); refreshLive(); }
  else if (b.dataset.buyprint) { addToCart({ kind: 'print', slug: ROUTE.slug, variant: b.dataset.buyprint, qty: 1 }); }
  else if (b.dataset.ask) {
    var w = work(ROUTE.slug), box = $('#ask');
    box.innerHTML = askForm(b.dataset.ask, w);
    $('input[name="naam"]', box).focus();
  }
  else if (b.dataset.view != null) {
    var it = work(ROUTE.slug), n = +b.dataset.view, m = $('.stage .main');
    m.src = pic(it, n, 1200); m.srcset = srcset(it, n); m.dataset.n = n;
    var r = it.pics[n].r; m.width = 600; m.height = Math.round(600 / r);
    $$('.views button').forEach(function (x) { x.classList.toggle('on', x === b); if (x === b) x.setAttribute('aria-current', 'true'); else x.removeAttribute('aria-current'); });
  }
  else if (b.classList.contains('main')) {}
  else if (b.dataset.rm != null) { CART.splice(+b.dataset.rm, 1); saveCart(); if (!CART.length) render(); else drawCart(); }
  else if (b.dataset.q) { var l = CART[+b.dataset.i]; l.qty = Math.max(1, Math.min(10, l.qty + +b.dataset.q)); saveCart(); drawCart(); }
});
document.addEventListener('click', function (e) {
  var m = e.target.closest('.stage .main');
  if (!m) return;
  var isPrint = ROUTE.name === 'print';
  var item = isPrint ? printBy(ROUTE.slug) : work(ROUTE.slug);
  lightbox(item, +(m.dataset.n || 0), isPrint);
});
document.addEventListener('change', function (e) {
  var t = e.target;
  if (t.name === 'ship') { SHIP = t.value; drawCart(); }
  if ((t.name === 'fmt' || t.name === 'fin') && ROUTE.name === 'print') {
    var s = PSEL[ROUTE.slug]; if (t.name === 'fmt') s.format = t.value; else s.framed = t.value === '1';
    $('#buy').innerHTML = printBuy(printBy(ROUTE.slug));
    var el = $('input[name="' + t.name + '"]:checked'); if (el) el.focus();
  }
});
document.addEventListener('submit', function (e) {
  var f = e.target;
  if (f.id === 'askform') {
    e.preventDefault();
    var fd = new FormData(f), btn = $('button[type="submit"]', f), msg = $('#askmsg');
    fd.append('form-name', 'interesse'); fd.append('taal', L);
    btn.disabled = true; btn.textContent = T.sending;
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(fd).toString() })
      .then(function (r) { if (!r.ok) throw r; msg.className = 'msg'; msg.textContent = T.sent; msg.hidden = false; $$('.field, button', f).forEach(function (x) { x.hidden = true; }); })
      .catch(function () { msg.className = 'msg err'; msg.innerHTML = T.sendErr + ' <a href="mailto:' + DATA.contact.email + '">' + DATA.contact.email + '</a>'; msg.hidden = false; btn.disabled = false; btn.textContent = T.send; });
  }
  if (f.id === 'comform') {
    e.preventDefault();
    var C = COM[L], d = new FormData(f);
    var text = C.msg(d.get('naam'), d.get('wat'), d.get('formaat'), d.get('verhaal') || '');
    var via = e.submitter && e.submitter.value;
    if (via === 'mail') location.href = 'mailto:' + DATA.contact.commissions + '?subject=' + encodeURIComponent(C.kick) + '&body=' + encodeURIComponent(text);
    else window.open(DATA.contact.whatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }
  if (f.id === 'payform') {
    e.preventDefault();
    var p = new FormData(f), pb = $('button[type="submit"]', f), err = $('#payerr');
    var customer = {}; p.forEach(function (v, k) { customer[k] = v; });
    if (SHIP === 'post-nl' || SHIP === 'deliver') customer.country = 'Nederland';
    pb.disabled = true; var label = pb.textContent; pb.textContent = T.paying; err.hidden = true;
    fetch('/.netlify/functions/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: CART, shipping: SHIP, customer: customer, lang: L, returnUrl: location.origin + url('thanks') }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw j; return j; }); })
      .then(function (j) { location.href = j.checkoutUrl; })
      .catch(function (j) { err.textContent = (j && j.error) || 'Er ging iets mis.'; err.hidden = false; pb.disabled = false; pb.textContent = label; loadLive(); });
  }
});
window.addEventListener('popstate', function () { render({ keepScroll: false }); });
window.addEventListener('storage', function (e) { if (e.key === 'staaf-cart') { try { CART = JSON.parse(e.newValue || '[]'); } catch (x) {} updateCount(); if (ROUTE && ROUTE.name === 'cart') render(); } });

/* ---------- Start ---------- */
function loadLive() {
  return fetch('/api/state', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw r; return r.json(); })
    .then(function (j) { LIVE = j; mergeLive(); refreshLive(); }).catch(function () {});
}
fetch('/data.json').then(function (r) { return r.json(); }).then(function (d) {
  DATA = d; mergeLive(); chrome();
  var r = parse(location.pathname), main = $('#view');
  var pre = main.dataset.route === r.name + (r.slug ? ':' + r.slug : '');
  var isNew = r.name === 'work' && !work(r.slug); // misschien een werk dat net in /beheer is toegevoegd
  if (pre && !location.search) { ROUTE = r; setNav(r.name); langLink(r); updateCount(); if (r.name === 'cart') drawCart(); if (r.name === 'thanks') { CART = []; saveCart(); } }
  else if (!isNew) render({ keepScroll: true });
  loadLive().then(function () { if (isNew || (ROUTE && ROUTE.notfound)) render(); });
});
})();
