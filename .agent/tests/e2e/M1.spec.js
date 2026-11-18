import { test, expect } from '@playwright/test';

test.describe('M1 — Scheletro, rotte e stile', () => {
  let errori = [];

  test.beforeEach(async ({ page }) => {
    errori = [];
    page.on('pageerror', (errore) => errori.push(errore.message));
  });

  test.afterEach(() => {
    expect(errori).toEqual([]);
  });

  test('la home mostra header, contenitore principale e titolo', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app-shell')).toBeVisible();
    await expect(page.getByTestId('app-header')).toBeVisible();
    await expect(page.getByTestId('main-content')).toBeVisible();
    await expect(page.getByTestId('home-page')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Prossima Gita' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Prossime esperienze' })).toBeVisible();
  });

  test('la rotta di dettaglio mostra l’identificativo dell’esperienza', async ({ page }) => {
    await page.goto('/esperienze/colli-valdobbiadene');
    await expect(page.getByTestId('experience-detail-page')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dettaglio esperienza' })).toBeVisible();
    await expect(page.getByText('colli-valdobbiadene')).toBeVisible();
  });

  test('la rotta admin mostra il pannello', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByTestId('admin-page')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pannello admin' })).toBeVisible();
  });

  test('una rotta sconosciuta mostra il fallback e torna alla home', async ({ page }) => {
    await page.goto('/non-esiste');
    await expect(page.getByTestId('not-found-page')).toBeVisible();
    await page.getByRole('link', { name: 'Torna alle esperienze' }).click();
    await expect(page.getByTestId('home-page')).toBeVisible();
  });
});
