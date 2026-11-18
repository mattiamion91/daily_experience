const ATTREZZATURA = {
  'Colli di Valdobbiadene': [
    'Scarpe da trekking',
    'Zaino 20 L',
    'Borraccia',
    'Cappello',
    'Crema solare',
    'Giacca leggera',
  ],
  Lagorai: [
    'Scarpe da hiking',
    'Zaino 30 L',
    'Casco',
    'Bastoncini',
    'Borraccia termica',
    'Giacca impermeabile',
    'Lampada frontale',
    'Mappa o GPS',
  ],
  Alpago: [
    'Scarpe da trekking',
    'Zaino 20 L',
    'Borraccia',
    'Cappello',
    'Repellente insetti',
    'Giacca leggera',
  ],
};

export function attrezzaturaPer(esperienza) {
  return ATTREZZATURA[esperienza?.name] ?? [];
}
