const { test, expect } = require('@playwright/test');

async function signIn(page) {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  test.skip(!email || !password, 'E2E_TEST_EMAIL/E2E_TEST_PASSWORD secrets are not configured');
  await page.goto('/');
  await page.locator('#authEmail').fill(email);
  await page.locator('#authPassword').fill(password);
  await page.locator('#authSubmit').click();
  await expect(page.locator('#appShell')).toBeVisible({ timeout: 15000 });
}

test.describe('WealthPilot product baseline', () => {
  test('dashboard loads with core wealth metrics', async ({ page }) => {
    await signIn(page);
    await expect(page.locator('#dashboard')).toBeVisible();
    await expect(page.locator('#netWorth')).toBeVisible();
    await expect(page.locator('#invested')).toBeVisible();
    await expect(page.locator('#gain')).toBeVisible();
  });

  test('primary navigation switches dashboard, portfolio, goals and advisor', async ({ page }) => {
    await signIn(page);
    for (const view of ['portfolio', 'goals', 'advisor', 'dashboard']) {
      await page.locator(`nav [data-view="${view}"]`).click();
      await expect(page.locator(`#${view}`)).toHaveClass(/active/);
    }
  });

  test('portfolio tabs switch cleanly', async ({ page }) => {
    await signIn(page);
    await page.locator('[data-view="portfolio"]').click();
    for (const tab of ['holdings', 'performance', 'allocation', 'transactions']) {
      await page.locator(`.tab[data-tab="${tab}"]`).click();
      await expect(page.locator(`#${tab}`)).toHaveClass(/active/);
    }
  });

  test('currency selector recalculates visible money values', async ({ page }) => {
    await signIn(page);
    const netWorth = page.locator('#netWorth');
    await expect(netWorth).toContainText('₹');
    await page.locator('#currency').selectOption('USD');
    await expect(netWorth).toContainText('$');
    await page.locator('#currency').selectOption('EUR');
    await expect(netWorth).toContainText('€');
    await page.locator('#currency').selectOption('INR');
    await expect(netWorth).toContainText('₹');
  });

  test('language selector updates dashboard labels', async ({ page }) => {
    await signIn(page);
    await page.locator('#lang').selectOption('hi');
    await expect(page.locator('[data-i18n="welcome"]')).toHaveText('आपका पूरा वेल्थ ओवरव्यू');
    await expect(page.locator('[data-i18n="dashboard"]')).toHaveText('पोर्टफोलियो डैशबोर्ड');
    await page.locator('#lang').selectOption('en');
    await expect(page.locator('[data-i18n="dashboard"]')).toHaveText('Portfolio Dashboard');
  });

  test('AI advisor validates empty question and accepts a question', async ({ page }) => {
    await signIn(page);
    await page.locator('[data-view="advisor"]').click();
    await page.locator('#ask').click();
    await expect(page.locator('#toast')).toHaveText('Type a question first.');
    await page.locator('#question').fill('Review my portfolio');
    await page.locator('#ask').click();
    await expect(page.locator('#toast')).toContainText('AI Advisor: "Review my portfolio"');
  });

  test('account menu exposes secure logout', async ({ page }) => {
    await signIn(page);
    await page.locator('#accountBtn').click();
    await expect(page.locator('#accountDropdown')).toBeVisible();
    await expect(page.locator('#logoutBtn')).toBeVisible();
  });
});
