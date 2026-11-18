export function formattaData(dataIso) {
  if (!dataIso) return '';
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${dataIso}T00:00:00`));
}

export function formattaOrario(orario) {
  if (!orario) return 'da definire';
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(`2000-01-01T${orario}`));
}

export function formattaDurata(minuti) {
  if (!minuti) return 'da definire';
  const ore = Math.floor(minuti / 60);
  const restanti = minuti % 60;
  return restanti ? `${ore} h ${restanti} min` : `${ore} h`;
}
