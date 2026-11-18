import { test, expect } from '@playwright/test';

const KEY_SESSIONE = 'sb-nqvpuiehktxzjlddxczj-auth-token';
const exp = (id, slug, name, date) => ({
  id, slug, name, date,
  image_url: `https://placehold.co/800x500/EA580C/FFFFFF?text=${slug}`,
  location: 'Belluno (BL)', description: 'Descrizione di prova',
  departure_time: '08:00', departure_place: 'Piazza', arrival_place: 'Monte',
  difficulty: 'facile', duration_minutes: 240, path_length_km: 10, elevation_gain_m: 300,
});
const ESPERIENZE = [
  exp('11111111-1111-1111-1111-111111111111', 'colli-di-valdobbiadene', 'Colli di Valdobbiadene', '2026-11-21'),
  exp('22222222-2222-2222-2222-222222222222', 'lagorai', 'Lagorai', '2026-11-28'),
];

function seed(page, email) {
  return page.addInitScript(
    ({ key, value }) => localStorage.setItem(key, value),
    {
      key: KEY_SESSIONE,
      value: JSON.stringify({
        access_token: 'token-test', refresh_token: 'refresh-test',
        expires_at: 4102444800, token_type: 'bearer',
        user: {
          id: 'utente-1', aud: 'authenticated', role: 'authenticated', email,
          app_metadata: { provider: 'email' }, user_metadata: {},
          created_at: '2026-01-01T00:00:00.000Z',
        },
      }),
    },
  );
}

async function mockApi(page, ruolo = 'user') {
  const cors = {
    'access-control-allow-origin': '*', 'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  };
  const json = { ...cors, 'content-type': 'application/json' };
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
      if (metodo === 'GET') {
        richieste.push(url);
        const slug = url.match(/slug=eq\.([^&]+)/)?.[1];
        const id = url.match(/id=eq\.([^&]+)/)?.[1];
        const trovata = ESPERIENZE.find(
          (elemento) => (slug && elemento.slug === decodeURIComponent(slug)) || (id && elemento.id === id),
        );
        const corpo = slug || id ? trovata ?? null : ESPERIENZE;
        const singolo = (request.headers()['accept'] ?? '').includes('pgrst.object');
        return route.fulfill({
          status: 200, headers: json,
          body: JSON.stringify(singolo ? corpo : corpo === null ? [] : corpo),
        });
      }
      if (metodo === 'POST') {
        const body = request.postDataJSON();
        richieste.push({ metodo, body });
        return route.fulfill({
          status: 201, headers: json,
          body: JSON.stringify({ id: 'nuova', ...body }),
        });
      }
    }
    return route.fulfill({ status: 200, headers: json, body: '{}' });
  });

  return richieste;
}

test.describe('M7 — Slug e login essenziale', () => {
  let errori = [];

  test.beforeEach(async ({ page }) => {
    errori = [];
    page.on('pageerror', (errore) => errori.push(errore.message));
  });

  test.afterEach(() => {
    expect(errori).toEqual([]);
  });

  test('il link della card mostra il nome dell’esperienza nella URL', async ({ page }) => {
    const richieste = await mockApi(page);
    await seed(page, 'user@weekend.demo');
    await page.goto('/');
    await page.getByTestId('experience-card-link').nth(1).click();

    await expect(page).toHaveURL(/\/esperienze\/lagorai$/);
    await expect(page.getByTestId('detail-name')).toHaveText('Lagorai');
    expect(richieste.some((voce) => typeof voce === 'string' && voce.includes('slug=eq.lagorai'))).toBe(true);
  });

  test('una vecchia URL con ID continua ad aprire il dettaglio', async ({ page }) => {
    const richieste = await mockApi(page);
    await seed(page, 'user@weekend.demo');
    await page.goto('/esperienze/11111111-1111-1111-1111-111111111111');

    await expect(page.getByTestId('detail-name')).toHaveText('Colli di Valdobbiadene');
    expect(richieste.some((voce) => typeof voce === 'string' && voce.includes('id=eq.11111111'))).toBe(true);
  });

  test('il form admin genera lo slug dal nome', async ({ page }) => {
    const richieste = await mockApi(page, 'admin');
    await seed(page, 'admin@weekend.demo');
    await page.goto('/admin');
    await page.getByTestId('admin-new-button').click();
    await page.getByTestId('admin-field-name').fill('Gita Nuova Prova');

    await expect(page.getByTestId('admin-slug-preview')).toHaveText('URL: /esperienze/gita-nuova-prova');
    await page.getByTestId('admin-field-date').fill('2027-09-18');
    await page.getByTestId('admin-field-location').fill('Treviso (TV)');
    await page.getByTestId('admin-save-button').click();

    await expect(page.getByTestId('admin-success')).toHaveText('Esperienza creata.');
    const post = richieste.find((voce) => voce && voce.metodo === 'POST');
    expect(post?.body.slug).toBe('gita-nuova-prova');
  });

  test('la modale di login non mostra più gli account demo', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');

    await expect(page.getByTestId('login-modal')).toBeVisible();
    await expect(page.getByTestId('demo-credentials')).toHaveCount(0);
    await expect(page.getByText('admin@weekend.demo')).toHaveCount(0);
  });
});
