import { test, expect } from '@playwright/test';

const KEY_SESSIONE = 'sb-nqvpuiehktxzjlddxczj-auth-token';
const ESPERIENZE = [
  { id: 'exp-lagorai', name: 'Lagorai', date: '2026-11-28', image_url: 'https://placehold.co/800x500/0D9488/FFFFFF?text=Lagorai', location: 'Lagorai (TN)' },
  { id: 'exp-colli', name: 'Colli di Valdobbiadene', date: '2026-11-21', image_url: 'https://placehold.co/800x500/EA580C/FFFFFF?text=Colli', location: 'Valdobbiadene (TV)' },
  { id: 'exp-alpago', name: 'Alpago', date: '2026-12-05', image_url: 'https://placehold.co/800x500/EAB308/1F2937?text=Alpago', location: 'Alpago (BL)' },
];

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

async function mockApi(page, esiti = {}) {
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
    if (url.includes('weekend_experiences') && esiti.erroreEsperienze) {
      await route.fulfill({
        status: 500,
        headers: { ...cors, 'content-type': 'application/json' },
        body: JSON.stringify({ message: 'errore database' }),
      });
      return;
    }
    const corpo = url.includes('weekend_experiences')
      ? esiti.esperienze ?? ESPERIENZE
      : [{ role: 'user' }];
    await route.fulfill({
      status: 200,
      headers: { ...cors, 'content-type': 'application/json' },
      body: JSON.stringify(corpo),
    });
  });
}

test.describe('M3 — Lista esperienze', () => {
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

  test('mostra tre card ordinate per data con nome, foto e luogo', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');

    await expect(page.getByTestId('experience-loading')).toBeHidden();
    await expect(page.getByTestId('experience-card')).toHaveCount(3);
    await expect(page.getByTestId('experience-name')).toHaveText([
      'Colli di Valdobbiadene',
      'Lagorai',
      'Alpago',
    ]);
    await expect(page.getByAltText('Anteprima di Colli di Valdobbiadene')).toBeVisible();
    await expect(page.getByTestId('experience-location').first()).toContainText('Valdobbiadene');
    await expect(page.getByTestId('experience-date').first()).toContainText('novembre');
  });

  test('il click su una card apre il dettaglio dell’esperienza', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');

    await page.getByTestId('experience-card-link').nth(1).click();

    await expect(page).toHaveURL(/\/esperienze\/exp-lagorai$/);
    await expect(page.getByTestId('experience-detail-page')).toBeVisible();
  });

  test('mostra uno stato vuoto quando non ci sono esperienze', async ({ page }) => {
    await mockApi(page, { esperienze: [] });
    await page.goto('/');

    await expect(page.getByTestId('experience-empty')).toBeVisible();
    await expect(page.getByTestId('experience-card')).toHaveCount(0);
  });

  test('mostra un errore se il caricamento fallisce', async ({ page }) => {
    await mockApi(page, { erroreEsperienze: true });
    await page.goto('/');

    await expect(page.getByTestId('experience-error')).toBeVisible();
  });
});
