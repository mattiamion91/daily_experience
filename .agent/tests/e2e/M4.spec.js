import { test, expect } from '@playwright/test';

const KEY_SESSIONE = 'sb-nqvpuiehktxzjlddxczj-auth-token';
const ESPERIENZA = {
  id: 'exp-lagorai',
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
  path_length_km: 18.0,
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

async function mockApi(page, esiti = {}) {
  const cors = {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  };
  const scritture = [];

  await page.route('**/auth/v1/**', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: cors });
      return;
    }
    await route.fulfill({ status: 200, headers: cors, body: '{}' });
  });

  await page.route('**/rest/v1/**', async (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: cors });
      return;
    }
    const url = request.url();
    const accetta = request.headers()['accept'] ?? '';
    const json = { ...cors, 'content-type': 'application/json' };

    if (url.includes('weekend_checklists') && request.method() === 'POST') {
      const corpo = request.postDataJSON();
      scritture.push(corpo);
      await route.fulfill({
        status: 201,
        headers: json,
        body: JSON.stringify({ id: 'riga-1', ...corpo }),
      });
      return;
    }
    let corpo;
    if (url.includes('weekend_checklists')) corpo = esiti.checklist ?? [];
    else if (url.includes('weekend_experiences')) corpo = accetta.includes('pgrst.object') ? ESPERIENZA : [ESPERIENZA];
    else corpo = accetta.includes('pgrst.object') ? { role: 'user' } : [{ role: 'user' }];

    await route.fulfill({ status: 200, headers: json, body: JSON.stringify(corpo) });
  });

  return scritture;
}

test.describe('M4 — Dettaglio e checklist', () => {
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

  test('il dettaglio mostra tutte le informazioni e i dati tecnici', async ({ page }) => {
    await mockApi(page);
    await page.goto('/esperienze/exp-lagorai');

    await expect(page.getByTestId('detail-name')).toHaveText('Lagorai');
    await expect(page.getByTestId('detail-image')).toBeVisible();
    await expect(page.getByTestId('detail-description')).toHaveText('Escursione tra creste e laghi alpini.');
    await expect(page.getByTestId('detail-date')).toContainText('novembre');
    await expect(page.getByTestId('detail-departure-time')).toHaveText('06:45');
    await expect(page.getByTestId('detail-departure-place')).toHaveText('Parcheggio di Passo Rolle');
    await expect(page.getByTestId('detail-arrival-place')).toHaveText('Lago delle Buse');
    await expect(page.getByTestId('technical-section')).toBeVisible();
    await expect(page.getByTestId('detail-difficulty')).toHaveText('difficile');
    await expect(page.getByTestId('detail-duration')).toHaveText('8 h');
    await expect(page.getByTestId('detail-path-length')).toHaveText('18 km');
    await expect(page.getByTestId('detail-elevation-gain')).toHaveText('950 m');
  });

  test('la modale mostra l’attrezzatura e salva lo stato della checkbox', async ({ page }) => {
    const scritture = await mockApi(page);
    await page.goto('/esperienze/exp-lagorai');

    await page.getByTestId('open-equipment-button').click();
    await expect(page.getByRole('heading', { name: 'Attrezzatura consigliata' })).toBeVisible();
    await expect(page.getByTestId('checklist-item')).toHaveCount(8);

    await page.getByTestId('equipment-checkbox').first().check();
    await expect(page.getByTestId('checklist-status')).toHaveText('Salvato');
    expect(scritture).toHaveLength(1);
    expect(scritture[0]).toMatchObject({
      user_id: 'utente-1',
      experience_id: 'exp-lagorai',
      packed: true,
    });

    await page.getByTestId('modal-close').click();
    await expect(page.getByTestId('equipment-modal')).toBeHidden();
  });

  test('la checklist salvata in precedenza risulta già spuntata', async ({ page }) => {
    await mockApi(page, {
      checklist: [{ id: 'riga-1', user_id: 'utente-1', experience_id: 'exp-lagorai', equipment: 'Scarpe da hiking', packed: true }],
    });
    await page.goto('/esperienze/exp-lagorai');
    await page.getByTestId('open-equipment-button').click();

    await expect(page.getByTestId('equipment-checkbox').first()).toBeChecked();
  });
});
