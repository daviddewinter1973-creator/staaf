"""Bouwt data.json (wat de site leest) uit data/works.json plus vaste instellingen."""
import json

d = json.load(open('data/works.json'))
for w in d['works']:
    w.pop('src', None)

data = {
    'series': [
        {'id': 'mokum', 'nl': 'Mokum in olie', 'en': 'Mokum in oil',
         'intro': {'nl': 'Amsterdam zoals het is: stoepen, grachten, buren en de dingen die op straat gebeuren. In olieverf.',
                   'en': 'Amsterdam as it is: pavements, canals, neighbours and the things that happen in the street. In oil.'}},
        {'id': 'staaf', 'nl': '50 jaar Staaf', 'en': '50 years of Staaf',
         'intro': {'nl': 'Het werk van de jubileumexpositie, met Staaf, het oranje alter ego, in de hoofdrol.',
                   'en': 'The work from the anniversary exhibition, starring Staaf, the orange alter ego.'}},
        {'id': 'temptation', 'nl': 'Temptation', 'en': 'Temptation', 'intro': None},
        {'id': 'snarfs', 'nl': 'Snarfs', 'en': 'Snarfs', 'intro': None},
    ],
    'featured': 'damrak-zeven-over-twaalf',
    'works': d['works'],
    'prints': d['prints'],
    'contact': {
        'address': ['Bloemgracht 158', '1015 TT Amsterdam'],
        'email': 'contact@galeriestaaf.nl',
        'commissions': 'commissions@staaf.nl',
        'phone': '06 55 79 02 46', 'tel': '+31655790246',
        'whatsapp': 'https://wa.me/31655790246',
        'instagram': 'https://www.instagram.com/commissions_by_staaf/',
        'twdzz': 'https://toenwedaarzozaten.netlify.app',
    },
    # Verzendkosten in centen. Originelen en ingelijste prints: ophalen of bezorgen in overleg.
    'shipping': {
        'zones': [
            {'id': 'nl', 'nl': 'Nederland', 'en': 'Netherlands', 'print': 1250},
            {'id': 'eu', 'nl': 'Europa', 'en': 'Europe', 'print': 2250},
            {'id': 'row', 'nl': 'Rest van de wereld', 'en': 'Rest of the world', 'print': 3500},
        ]
    },
}
json.dump(data, open('data.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('data.json', len(json.dumps(data)) // 1024, 'KB')
