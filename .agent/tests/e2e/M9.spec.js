import { test, expect } from '@playwright/test';

const KEY_SESSIONE = 'sb-nqvpuiehktxzjlddxczj-auth-token';
const ESPERIENZA = {
  id: 'exp-lagorai',
  slug: 'lagorai',
  name: 'Lagorai',
  date: '2026-11-28',
  image_url: 'https://placehold.co/800x500/0D9488/FFFFFF?text=Lagorai',
  location: 'Lagorai (TN)',
  description: 'Escursione tra creste e laghi alpini.',
  departure_time: '06:45:00',
  departure_place: 'Parcheggio di Passo Rolle',
  arrival_place: 'Lago delle Buse',
  difficulty: 'difficile',
  duration_minutes: 480,
  path_length_km: 18,
  elevation_gain_m: 950,
};

const sessione = {
  access_token: 'token-test',
  refresh_token: 'refresh-test',
  expires_at: 4102444800,
  token_type: 'bearer',
  user: {
    id: 'utente-1',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'user@weekend.demo',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {},
    created_at: '2026-01-01T00:00:00.000Z',
  },
};

async function mockApi(page, errore = false) {
  const cors = {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  };

  await page.route('**/auth/v1/**', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: cors });
      return;
    }
    await route.fulfill({ status: 200, headers: cors, body: '{}' });
  });

  await page.route('**/rest/v1/**', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: cors });
      return;
    }
    const url = route.request().url();
    if (url.includes('weekend_experiences') && errore) {
      await route.fulfill({
        status: 500,
        headers: { ...cors, 'content-type': 'application/json' },
        body: JSON.stringify({ message: 'errore database' }),
      });
      return;
    }
    const singolo = (route.request().headers()['accept'] ?? '').includes('pgrst.object');
    const corpo = url.includes('weekend_experiences')
      ? singolo ? ESPERIENZA : [ESPERIENZA]
      : singolo ? { role: 'user' } : [{ role: 'user' }];
    await route.fulfill({
      status: 200,
      headers: { ...cors, 'content-type': 'application/json' },
      body: JSON.stringify(corpo),
    });
  });
}

test.describe('M9 — Ritorno alla lista esperienze', () => {
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

  test('il pulsante nel dettaglio torna alla lista esperienze', async ({ page }) => {
    await mockApi(page);
    await page.goto('/esperienze/lagorai');
    await expect(page.getByTestId('detail-name')).toHaveText('Lagorai');

    await page.getByRole('button', { name: 'Torna a lista esperienze' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId('home-page')).toBeVisible();
  });

  test('il pulsante torna alla lista anche se il dettaglio non si carica', async ({ page }) => {
    await mockApi(page, true);
    await page.goto('/esperienze/lagorai');
    await expect(page.getByTestId('detail-error')).toBeVisible();

    await page.getByTestId('back-to-list-button').click();

    await expect(page.getByTestId('home-page')).toBeVisible();
  });

  test('il logo dell’header torna alla lista esperienze', async ({ page }) => {
    await mockApi(page);
    await page.goto('/esperienze/lagorai');
    await expect(page.getByTestId('detail-name')).toHaveText('Lagorai');

    const logo = page.getByRole('link', { name: 'Prossima Gita, torna alla lista esperienze' });
    await expect(logo).toBeVisible();
    await logo.click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId('home-page')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Prossima Gita' })).toBeVisible();
  });
});
