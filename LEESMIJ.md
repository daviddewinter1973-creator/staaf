# staaf.nl

Statische site met een paar Netlify Functions. Geen Squarespace meer.

## Dagelijks gebruik (geen code nodig)
Ga naar **/beheer** en log in met het beheerwachtwoord.
- **Werken**: status (beschikbaar, gereserveerd, verkocht, niet te koop), prijs, titels, techniek, formaat, reeks, toelichting, verbergen.
- **Prints**: voorraad per formaat en uitvoering. Zichtbaar op de site vanaf 10 of minder.
- **Nieuw werk**: titel, gegevens en foto's. Staat direct online.
- **Verkopen**: betaalde bestellingen. Reserveringen en vragen staan in Netlify onder *Forms*.

Een betaald origineel wordt vanzelf *verkocht*. Wie afrekent, houdt het werk 20 minuten vast,
zodat niemand anders het tegelijk kan kopen.

## Netlify-instellingen
- Environment variables: `MOLLIE_API_KEY` (test_… of live_…) en `ADMIN_PASSWORD`.
- Forms: formulierdetectie aanzetten en een e-mailmelding instellen voor het formulier *interesse*.

## Opbouw
- `tools/shell.html`: de paginaschil. `index.html`, `werk/*.html` enz. worden daaruit gemaakt door `tools/prerender.py`.
- `app.js`: de site (NL en EN), `style.css`: vormgeving, `shipping.js`: verzendregels.
- `data.json`: alle werken en prints, gemaakt door `tools/build_data.py` uit `data/works.json`.
- `netlify/functions/`: `state` (live status), `checkout` (Mollie), `mollie-webhook`, `beheer`, `beeld` (foto's van zelf toegevoegde werken).

Na een wijziging in app.js, style.css of data: `python3 tools/build_data.py && python3 tools/prerender.py`.
