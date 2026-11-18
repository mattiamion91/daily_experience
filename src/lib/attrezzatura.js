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
  const suggerimenti = esperienza?.suggested_equipment;
  if (Array.isArray(suggerimenti)) {
    return suggerimenti.map((voce) => String(voce).trim()).filter(Boolean);
  }
  return ATTREZZATURA[esperienza?.name] ?? [];
}
