import { test, expect } from '@playwright/test';
// Run against an unconfigured instance: real public UI and closed administration.
test('présentation, portrait et parcours honnête', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Des idées.Du code.Des produits.');
  await expect(page.getByAltText('Portrait illustré d’Aris NK')).toBeVisible();
  await expect(page.getByText('Le cap sur le SaaS.')).toBeVisible();
  await expect(page.getByText('Mes compétences, bientôt ici.')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
test('navigation mobile et pages vides sans faux projets', async ({ page, isMobile }) => {
  await page.goto('/');
  if (isMobile) await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
  await page.getByRole('navigation', { name: isMobile ? 'Navigation mobile' : 'Navigation principale', exact: true }).getByRole('link', { name: 'Projets', exact: true }).click();
  await expect(page.getByText('Les projets arrivent ici.')).toBeVisible();
  await page.goto('/services');
  await expect(page.getByText('Une idée à concrétiser ?')).toBeVisible();
});
test('contacts réels et WhatsApp sans appel', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.locator('a[href="mailto:mail.pro@arislabs.online"]').first()).toBeVisible();
  await expect(page.locator('a[href="https://wa.me/243827296237"]')).toBeVisible();
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator('form')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
test('administration et prévisualisation protégées', async ({ page }) => {
  await page.goto('/admin/preview/projects/00000000-0000-4000-8000-000000000001');
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole('button', { name: 'Se connecter' })).toBeDisabled();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});
test('projet inconnu renvoie 404 et sitemap exclut admin', async ({ page, request }) => {
  const response = await page.goto('/projets/inexistant');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Un détour imprévu.' })).toBeVisible();
  const sitemap = await request.get('/sitemap.xml');
  expect(await sitemap.text()).not.toContain('/admin');
});
