import { test, expect } from '@playwright/test';

const KEY_SESSIONE = 'sb-nqvpuiehktxzjlddxczj-auth-token';
const exp = (id, name, date, location) => ({
  id, name, date, location,
  image_url: `https://placehold.co/800x500/EA580C/FFFFFF?text=${id}`,
  description: 'Descrizione di prova',
  departure_time: '08:00', departure_place: 'Piazza', arrival_place: 'Monte',
  difficulty: 'facile', duration_minutes: 240, path_length_km: 10, elevation_gain_m: 300,
});
const ESPERIENZE = [
  exp('exp-colli', 'Colli di Valdobbiadene', '2026-11-21', 'Valdobbiadene (TV)'),
  exp('exp-lagorai', 'Lagorai', '2026-11-28', 'Lagorai (TN)'),
  exp('exp-alpago', 'Alpago', '2026-12-05', 'Alpago (BL)'),
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

    if (url.includes('weekend_experiences')) {
      const singolo = (request.headers()['accept'] ?? '').includes('pgrst.object');
      const id = url.match(/id=eq\.([^&]+)/)?.[1] ?? null;
      if (metodo === 'GET') {
        return route.fulfill({ status: 200, headers: json, body: JSON.stringify(dati) });
      }
      if (metodo === 'POST') {
        const body = request.postDataJSON();
        const creata = { id: 'exp-nuova', ...body };
        dati = [...dati, creata];
        richieste.push({ metodo, body });
        return route.fulfill({
          status: 201, headers: json,
          body: JSON.stringify(singolo ? creata : [creata]),
        });
      }
      if (metodo === 'PATCH') {
        const body = request.postDataJSON();
        dati = dati.map((elemento) => (elemento.id === id ? { ...elemento, ...body } : elemento));
        richieste.push({ metodo, id, body });
        const aggiornata = dati.find((elemento) => elemento.id === id);
        return route.fulfill({
          status: 200, headers: json,
          body: JSON.stringify(singolo ? aggiornata : [aggiornata]),
        });
      }
      if (metodo === 'DELETE') {
        dati = dati.filter((elemento) => elemento.id !== id);
        richieste.push({ metodo, id });
        return route.fulfill({ status: 204, headers: cors });
      }
    }
    return route.fulfill({ status: 200, headers: json, body: '{}' });
  });

  return richieste;
}

test.describe('M5 — Pannello admin CRUD', () => {
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

  test('un utente normale vede accesso negato e può tornare alle esperienze', async ({ page }) => {
    await mockApi(page, { ruolo: 'user' });
    await page.goto('/admin');

    await expect(page.getByTestId('admin-denied')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Accesso negato' })).toBeVisible();
    await page.getByRole('link', { name: 'Torna alle esperienze' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId('home-page')).toBeVisible();
  });

  test('l’admin vede il pannello con l’elenco delle esperienze', async ({ page }) => {
    await mockApi(page);
    await page.goto('/admin');

    await expect(page.getByTestId('admin-page')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pannello admin' })).toBeVisible();
    await expect(page.getByTestId('admin-list-item')).toHaveCount(3);
    await expect(page.getByTestId('admin-item-name')).toHaveText([
      'Colli di Valdobbiadene', 'Lagorai', 'Alpago',
    ]);
  });

  test('l’admin crea un’esperienza compilando tutti i campi', async ({ page }) => {
    const richieste = await mockApi(page);
    await page.goto('/admin');
    await page.getByTestId('admin-new-button').click();
    await expect(page.getByTestId('admin-form-title')).toHaveText('Nuova esperienza');

    await page.getByTestId('admin-field-name').fill('Gita di prova');
    await page.getByTestId('admin-field-date').fill('2027-08-14');
    await page.getByTestId('admin-field-image-url').fill('https://placehold.co/800x500/EA580C/FFFFFF?text=Prova');
    await page.getByTestId('admin-field-location').fill('Belluno (BL)');
    await page.getByTestId('admin-field-description').fill('Una gita di prova');
    await page.getByTestId('admin-field-departure-time').fill('07:15');
    await page.getByTestId('admin-field-departure-place').fill('Piazza del Duomo');
    await page.getByTestId('admin-field-arrival-place').fill('Monte Val');
    await page.getByTestId('admin-field-difficulty').selectOption('media');
    await page.getByTestId('admin-field-duration-minutes').fill('180');
    await page.getByTestId('admin-field-path-length-km').fill('10.5');
    await page.getByTestId('admin-field-elevation-gain-m').fill('600');
    await page.getByTestId('admin-save-button').click();

    await expect(page.getByTestId('admin-success')).toHaveText('Esperienza creata.');
    await expect(page.getByTestId('admin-list-item')).toHaveCount(4);
    expect(richieste.find((r) => r.metodo === 'POST')?.body).toMatchObject({
      name: 'Gita di prova', date: '2027-08-14',
      image_url: 'https://placehold.co/800x500/EA580C/FFFFFF?text=Prova',
      location: 'Belluno (BL)', description: 'Una gita di prova', departure_time: '07:15',
      departure_place: 'Piazza del Duomo', arrival_place: 'Monte Val', difficulty: 'media',
      duration_minutes: 180, path_length_km: 10.5, elevation_gain_m: 600,
    });
  });

  test('l’admin modifica un’esperienza e il cambiamento appare nella lista pubblica', async ({ page }) => {
    const richieste = await mockApi(page);
    await page.goto('/admin');
    await page.getByTestId('admin-edit-button').first().click();

    await expect(page.getByTestId('admin-form-title')).toHaveText('Modifica esperienza');
    await expect(page.getByTestId('admin-field-name')).toHaveValue('Colli di Valdobbiadene');
    await page.getByTestId('admin-field-name').fill('Colli aggiornati');
    await page.getByTestId('admin-field-image-url').fill('https://placehold.co/800x500/0D9488/FFFFFF?text=Nuova');
    await page.getByTestId('admin-save-button').click();

    await expect(page.getByTestId('admin-success')).toHaveText('Esperienza aggiornata.');
    await expect(page.getByTestId('admin-item-name').first()).toHaveText('Colli aggiornati');
    const patch = richieste.find((r) => r.metodo === 'PATCH');
    expect(patch?.id).toBe('exp-colli');
    expect(patch?.body).toMatchObject({ name: 'Colli aggiornati' });

    await page.goto('/');
    await expect(page.getByTestId('experience-name').first()).toHaveText('Colli aggiornati');
  });

  test('l’admin elimina un’esperienza solo dopo conferma', async ({ page }) => {
    const richieste = await mockApi(page);
    await page.goto('/admin');

    await page.getByTestId('admin-delete-button').first().click();
    await expect(page.getByTestId('admin-delete-confirm')).toContainText('Colli di Valdobbiadene');
    await page.getByTestId('admin-cancel-delete').click();
    await expect(page.getByTestId('admin-list-item')).toHaveCount(3);

    await page.getByTestId('admin-delete-button').first().click();
    await page.getByTestId('admin-confirm-delete').click();

    await expect(page.getByTestId('admin-success')).toHaveText('Esperienza eliminata.');
    await expect(page.getByTestId('admin-list-item')).toHaveCount(2);
    expect(richieste.find((r) => r.metodo === 'DELETE')?.id).toBe('exp-colli');
  });
});
