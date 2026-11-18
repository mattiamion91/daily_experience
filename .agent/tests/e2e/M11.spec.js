import { test, expect } from '@playwright/test';

const EMAIL_UTENTE = 'user@weekend.demo';
const TOKEN = 'token-utente-1';

const utente = () => ({
  id: 'utente-1',
  aud: 'authenticated',
  role: 'authenticated',
  email: EMAIL_UTENTE,
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: {},
  created_at: '2026-01-01T00:00:00.000Z',
});

const sessione = () => ({
  access_token: TOKEN,
  refresh_token: 'refresh-utente-1',
  expires_in: 3600,
  expires_at: 4102444800,
  token_type: 'bearer',
  user: utente(),
});

const ESPERIENZE = [
  {
    id: 'exp-colli', slug: 'exp-colli', name: 'Colli di Valdobbiadene',
    date: '2026-11-21', location: 'Valdobbiadene (TV)',
    image_url: 'https://placehold.co/800x500/EA580C/FFFFFF?text=Colli',
    description: 'Descrizione di prova', departure_time: '08:00',
    departure_place: 'Piazza', arrival_place: 'Monte', difficulty: 'facile',
    duration_minutes: 240, path_length_km: 10, elevation_gain_m: 300,
    suggested_equipment: [],
  },
  {
    id: 'exp-lagorai', slug: 'exp-lagorai', name: 'Lagorai',
    date: '2026-11-28', location: 'Lagorai (TN)',
    image_url: 'https://placehold.co/800x500/0D9488/FFFFFF?text=Lagorai',
    description: 'Descrizione di prova', departure_time: '08:00',
    departure_place: 'Piazza', arrival_place: 'Monte', difficulty: 'facile',
    duration_minutes: 240, path_length_km: 10, elevation_gain_m: 300,
    suggested_equipment: [],
  },
];

// Riproduce le policy RLS: da anonimi la tabella è vuota, dopo il login restituisce i dati.
async function mockSupabase(page) {
  const cors = {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  };
  const json = { ...cors, 'content-type': 'application/json' };

  await page.route('**/auth/v1/**', (route) => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: cors });
    }
    if (route.request().url().includes('/token')) {
      return route.fulfill({ status: 200, headers: json, body: JSON.stringify(sessione()) });
    }
    return route.fulfill({ status: 200, headers: json, body: '{}' });
  });

  await page.route('**/rest/v1/**', (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });

    const autenticato = (request.headers()['authorization'] ?? '').includes(TOKEN);
    const url = request.url();
    if (url.includes('weekend_profiles')) {
      return route.fulfill({ status: 200, headers: json, body: '[{"role":"user"}]' });
    }
    if (url.includes('weekend_checklists')) {
      return route.fulfill({ status: 200, headers: json, body: '[]' });
    }
    if (url.includes('weekend_experiences')) {
      if (!autenticato) return route.fulfill({ status: 200, headers: json, body: '[]' });
      const slug = url.match(/slug=eq\.([^&]+)/)?.[1];
      const trovata = slug ? ESPERIENZE.find((esperienza) => esperienza.slug === decodeURIComponent(slug)) : null;
      return route.fulfill({
        status: 200, headers: json,
        body: JSON.stringify(slug ? trovata ?? null : ESPERIENZE),
      });
    }
    return route.fulfill({ status: 200, headers: json, body: '{}' });
  });
}

test.describe('M11 — Caricamento esperienze dopo il login', () => {
  let errori = [];

  test.beforeEach(async ({ page }) => {
    errori = [];
    page.on('pageerror', (errore) => errori.push(errore.message));
  });

  test.afterEach(() => {
    expect(errori).toEqual([]);
  });

  test('dopo il login le esperienze compaiono senza refresh', async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/');

    await expect(page.getByTestId('login-modal')).toBeVisible();
    await expect(page.getByTestId('experience-empty')).toBeVisible();

    await page.getByTestId('login-email').fill(EMAIL_UTENTE);
    await page.getByTestId('login-password').fill('Demo1234!');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-modal')).toBeHidden();
    await expect(page.getByTestId('experience-card')).toHaveCount(2);
    await expect(page.getByTestId('experience-name')).toHaveText([
      'Colli di Valdobbiadene', 'Lagorai',
    ]);
  });

  test('dopo il login anche una rotta di dettaglio si carica senza refresh', async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/esperienze/exp-lagorai');

    await expect(page.getByTestId('login-modal')).toBeVisible();
    await page.getByTestId('login-email').fill(EMAIL_UTENTE);
    await page.getByTestId('login-password').fill('Demo1234!');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-modal')).toBeHidden();
    await expect(page.getByTestId('detail-name')).toHaveText('Lagorai');
    await expect(page.getByTestId('open-equipment-button')).toBeVisible();
  });
});
