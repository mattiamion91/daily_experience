import { test, expect } from '@playwright/test';

const KEY_SESSIONE = 'sb-nqvpuiehktxzjlddxczj-auth-token';
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
    app_metadata: { provider: 'email' },
    user_metadata: {},
    created_at: '2026-01-01T00:00:00.000Z',
  },
};

async function mockApi(page) {
  const cors = {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  };
  const json = { ...cors, 'content-type': 'application/json' };

  await page.route('**/auth/v1/**', (route) =>
    route.fulfill({ status: 200, headers: json, body: '{}' }));

  await page.route('**/rest/v1/**', (route) => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    const corpo = route.request().url().includes('weekend_experiences') ? '[]' : '[{"role":"user"}]';
    return route.fulfill({ status: 200, headers: json, body: corpo });
  });
}

test.describe('M12 — Nessuna sottolineatura al passaggio sul titolo', () => {
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

  test('il titolo dell’header resta senza sottolineatura in hover e il link funziona', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');

    const titolo = page.getByRole('heading', { name: 'Prossima Gita', level: 1 });
    await expect(titolo).toBeVisible();
    await expect(titolo).toHaveCSS('text-decoration-line', 'none');

    await page.getByTestId('logo-link').hover();
    await expect(titolo).toHaveCSS('text-decoration-line', 'none');

    await page.getByTestId('logo-link').click();
    await expect(page).toHaveURL('/');
  });
});
