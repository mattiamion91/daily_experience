import { test, expect } from '@playwright/test';

const KEY_SESSIONE = 'sb-nqvpuiehktxzjlddxczj-auth-token';
const exp = (id, name, date, extra = {}) => ({
  id, slug: id, name, date,
  image_url: `https://placehold.co/800x500/EA580C/FFFFFF?text=${id}`,
  location: 'Belluno (BL)', description: 'Descrizione di prova',
  departure_time: '08:00', departure_place: 'Piazza', arrival_place: 'Monte',
  difficulty: 'facile', duration_minutes: 240, path_length_km: 10, elevation_gain_m: 300,
  suggested_equipment: [],
  ...extra,
});
const ESPERIENZE = [
  exp('exp-colli', 'Colli di Valdobbiadene', '2026-11-21', {
    suggested_equipment: ['Scarpe da trekking', 'Borraccia'],
  }),
  exp('exp-lagorai', 'Lagorai', '2026-11-28'),
  exp('exp-alpago', 'Alpago', '2026-12-05'),
];
const sessione = {
  access_token: 'token-test', refresh_token: 'refresh-test',
  expires_at: 4102444800, token_type: 'bearer',
  user: {
    id: 'utente-1', aud: 'authenticated', role: 'authenticated',
    email: 'admin@weekend.demo', app_metadata: { provider: 'email' },
    user_metadata: {}, created_at: '2026-01-01T00:00:00.000Z',
  },
};

async function mockApi(page, { ruolo = 'admin' } = {}) {
  const cors = {
    'access-control-allow-origin': '*', 'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  };
  const json = { ...cors, 'content-type': 'application/json' };
  let dati = ESPERIENZE.map((elemento) => ({ ...elemento }));
  const richieste = [];

  await page.route('**/auth/v1/**', (route) =>
    route.fulfill({ status: 200, headers: cors, body: '{}' }));

  await page.route('**/rest/v1/**', async (route) => {
    const request = route.request();
    const metodo = request.method();
    const url = request.url();
    if (metodo === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });

    if (url.includes('weekend_profiles')) {
      const singolo = (request.headers()['accept'] ?? '').includes('pgrst.object');
      return route.fulfill({
        status: 200, headers: json,
        body: JSON.stringify(singolo ? { role: ruolo } : [{ role: ruolo }]),
      });
    }
    if (url.includes('weekend_checklists')) {
      return route.fulfill({ status: 200, headers: json, body: '[]' });
    }
    if (url.includes('weekend_experiences')) {
      const singolo = (request.headers()['accept'] ?? '').includes('pgrst.object');
      const id = url.match(/id=eq\.([^&]+)/)?.[1] ?? null;
      const slug = url.match(/slug=eq\.([^&]+)/)?.[1] ?? null;
      if (metodo === 'GET') {
        const trovata = dati.find((elemento) =>
          (id && elemento.id === id) || (slug && elemento.slug === decodeURIComponent(slug)));
        return route.fulfill({
          status: 200, headers: json,
          body: JSON.stringify(id || slug ? trovata ?? null : dati),
        });
      }
      if (metodo === 'POST' || metodo === 'PATCH') {
        const body = request.postDataJSON();
        richieste.push({ metodo, id, body });
        const risultato = metodo === 'POST'
          ? { id: 'exp-nuova', ...body }
          : { ...dati.find((elemento) => elemento.id === id), ...body };
        if (metodo === 'POST') dati = [...dati, risultato];
        else dati = dati.map((elemento) => (elemento.id === id ? risultato : elemento));
        return route.fulfill({
          status: metodo === 'POST' ? 201 : 200, headers: json,
          body: JSON.stringify(singolo ? risultato : [risultato]),
        });
      }
    }
    return route.fulfill({ status: 200, headers: json, body: '{}' });
  });

  return richieste;
}

test.describe('M10 — Attrezzatura modificabile e card desktop', () => {
  let errori = [];

  test.beforeEach(async ({ page }) => {
    errori = [];
    page.on('pageerror', (errore) => errori.push(errore.message));
    await page.addInitScript(
      ({ key, value }) => localStorage.setItem(key, value),
      { key: KEY_SESSIONE, value: JSON.stringify(sessione) },
    );
  });

  test.afterEach(() => {
    expect(errori).toEqual([]);
  });

  test('l’admin aggiunge l’attrezzatura consigliata a una nuova esperienza', async ({ page }) => {
    const richieste = await mockApi(page);
    await page.goto('/admin');
    await page.getByTestId('admin-new-button').click();
    await page.getByTestId('admin-field-name').fill('Gita con attrezzatura');
    await page.getByTestId('admin-field-date').fill('2027-09-18');
    await page.getByTestId('admin-field-location').fill('Treviso (TV)');
    await page.getByTestId('admin-field-equipment').fill('Scarpe da trekking\nZaino 30 L\nBorraccia');
    await page.getByTestId('admin-save-button').click();

    await expect(page.getByTestId('admin-success')).toHaveText('Esperienza creata.');
    const post = richieste.find((richiesta) => richiesta.metodo === 'POST');
    expect(post?.body.suggested_equipment).toEqual(['Scarpe da trekking', 'Zaino 30 L', 'Borraccia']);
  });

  test('l’admin modifica l’attrezzatura consigliata di un’esperienza esistente', async ({ page }) => {
    const richieste = await mockApi(page);
    await page.goto('/admin');
    await page.getByTestId('admin-edit-button').first().click();

    const campo = page.getByTestId('admin-field-equipment');
    await expect(campo).toHaveValue('Scarpe da trekking\nBorraccia');
    await campo.fill('Scarpe da trekking\nBastoncini\nGiacca impermeabile');
    await page.getByTestId('admin-save-button').click();

    await expect(page.getByTestId('admin-success')).toHaveText('Esperienza aggiornata.');
    const patch = richieste.find((richiesta) => richiesta.metodo === 'PATCH');
    expect(patch?.body.suggested_equipment).toEqual([
      'Scarpe da trekking', 'Bastoncini', 'Giacca impermeabile',
    ]);
  });

  test('la modale mostra l’attrezzatura salvata per quell’esperienza', async ({ page }) => {
    await mockApi(page, { ruolo: 'user' });
    await page.goto('/esperienze/exp-colli');
    await page.getByTestId('open-equipment-button').click();

    await expect(page.getByTestId('checklist-item')).toHaveText([
      'Scarpe da trekking', 'Borraccia',
    ]);
  });

  test('in desktop le card hanno la stessa dimensione e l’immagine non copre il testo', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await mockApi(page, { ruolo: 'user' });
    await page.goto('/');
    await expect(page.getByTestId('experience-card')).toHaveCount(3);

    const misure = await page.evaluate(() =>
      [...document.querySelectorAll('[data-testid="experience-card"]')].map((card) => {
        const immagine = card.querySelector('img').getBoundingClientRect();
        const testo = card.querySelector('[data-testid="experience-card-link"] > div:last-child').getBoundingClientRect();
        const riquadro = card.getBoundingClientRect();
        return {
          larghezza: Math.round(riquadro.width),
          altezza: Math.round(riquadro.height),
          immagineDestra: Math.round(immagine.right),
          testoSinistra: Math.round(testo.left),
        };
      }));

    expect(misure.map((card) => card.larghezza)).toEqual([
      misure[0].larghezza, misure[0].larghezza, misure[0].larghezza,
    ]);
    expect(misure.map((card) => card.altezza)).toEqual([
      misure[0].altezza, misure[0].altezza, misure[0].altezza,
    ]);
    for (const card of misure) {
      expect(card.immagineDestra).toBeLessThanOrEqual(card.testoSinistra);
    }
  });
});
