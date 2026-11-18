import { test, expect } from '@playwright/test';

const KEY_SESSIONE = 'sb-nqvpuiehktxzjlddxczj-auth-token';
const EMAIL_UTENTE = 'user@weekend.demo';

const utente = (email = EMAIL_UTENTE, id = 'utente-1') => ({
  id,
  aud: 'authenticated',
  role: 'authenticated',
  email,
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: {},
  created_at: '2026-01-01T00:00:00.000Z',
});

const sessione = (email = EMAIL_UTENTE, id = 'utente-1') => ({
  access_token: `token-${id}`,
  refresh_token: `refresh-${id}`,
  expires_in: 3600,
  expires_at: 4102444800,
  token_type: 'bearer',
  user: utente(email, id),
});

async function mockSupabase(page, esiti = {}) {
  const cors = {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  };

  await page.route('**/auth/v1/**', async (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: cors });
      return;
    }
    const url = request.url();
    if (url.includes('/token')) {
      if (esiti.login === 'errore') {
        await route.fulfill({
          status: 400,
          headers: { ...cors, 'content-type': 'application/json' },
          body: JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid login credentials' }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        headers: { ...cors, 'content-type': 'application/json' },
        body: JSON.stringify(sessione()),
      });
      return;
    }
    if (url.includes('/signup')) {
      await route.fulfill({
        status: 200,
        headers: { ...cors, 'content-type': 'application/json' },
        body: JSON.stringify({ user: utente('nuovo@weekend.demo', 'utente-nuovo'), session: null }),
      });
      return;
    }
    if (url.includes('/logout')) {
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
    const accetta = route.request().headers()['accept'] ?? '';
    const profilo = { role: esiti.ruolo ?? 'user' };
    const corpo = accetta.includes('pgrst.object') ? profilo : [profilo];
    await route.fulfill({
      status: 200,
      headers: { ...cors, 'content-type': 'application/json' },
      body: JSON.stringify(corpo),
    });
  });
}

test.describe('M2 — Autenticazione', () => {
  let errori = [];

  test.beforeEach(async ({ page }) => {
    errori = [];
    page.on('pageerror', (errore) => errori.push(errore.message));
  });

  test.afterEach(() => {
    expect(errori).toEqual([]);
  });

  test('la modale di login appare per prima e permette accedi, mostra password ed esci', async ({ page }) => {
    const esiti = { login: 'errore' };
    await mockSupabase(page, esiti);
    await page.goto('/');

    await expect(page.getByTestId('login-modal')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bentornato nel gruppo' })).toBeVisible();
    await expect(page.getByTestId('go-to-register')).toBeVisible();

    await page.getByTestId('login-show-password').check();
    await expect(page.getByTestId('login-password')).toHaveAttribute('type', 'text');
    await page.getByTestId('login-show-password').uncheck();
    await expect(page.getByTestId('login-password')).toHaveAttribute('type', 'password');

    await page.getByTestId('login-email').fill(EMAIL_UTENTE);
    await page.getByTestId('login-password').fill(' errata ');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('login-error')).toContainText('Email o password non corretti');

    esiti.login = 'ok';
    await page.getByTestId('login-password').fill('Demo1234!');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('login-modal')).toBeHidden();
    await expect(page.getByTestId('user-email')).toHaveText(EMAIL_UTENTE);

    await page.getByTestId('logout-button').click();
    await expect(page.getByTestId('login-modal')).toBeVisible();
  });

  test('il link porta alla registrazione con conferma password e mostra password', async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/');
    await page.getByTestId('go-to-register').click();

    await expect(page.getByTestId('register-modal')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Crea il tuo account' })).toBeVisible();

    await page.getByTestId('register-show-password').check();
    await expect(page.getByTestId('register-password')).toHaveAttribute('type', 'text');
    await expect(page.getByTestId('register-confirm-password')).toHaveAttribute('type', 'text');

    await page.getByTestId('register-email').fill('nuovo@weekend.demo');
    await page.getByTestId('register-password').fill('Demo1234!');
    await page.getByTestId('register-confirm-password').fill('Demo1234!');
    await page.getByTestId('register-submit').click();
    await expect(page.getByTestId('register-success')).toContainText('conferma la tua email');
  });

  test('la registrazione segnala password diverse', async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/');
    await page.getByTestId('go-to-register').click();

    await page.getByTestId('register-email').fill('nuovo@weekend.demo');
    await page.getByTestId('register-password').fill('Demo1234!');
    await page.getByTestId('register-confirm-password').fill('Altro1234!');
    await page.getByTestId('register-submit').click();

    await expect(page.getByTestId('register-error')).toHaveText('Le password non coincidono.');
  });

  test('una sessione già presente mantiene l’utente autenticato', async ({ page }) => {
    await page.addInitScript(
      ({ key, value }) => localStorage.setItem(key, value),
      { key: KEY_SESSIONE, value: JSON.stringify(sessione()) },
    );
    await mockSupabase(page);
    await page.goto('/');

    await expect(page.getByTestId('login-modal')).toBeHidden();
    await expect(page.getByTestId('user-email')).toHaveText(EMAIL_UTENTE);
    await expect(page.getByTestId('home-page')).toBeVisible();
  });
});
