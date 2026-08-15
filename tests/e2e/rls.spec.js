const { test, expect } = require('@playwright/test');

const emailA = process.env.E2E_TEST_EMAIL;
const passwordA = process.env.E2E_TEST_PASSWORD;
const emailB = process.env.E2E_TEST_EMAIL_2;
const passwordB = process.env.E2E_TEST_PASSWORD_2;

async function signIn(page, email, password) {
  await page.goto('/');
  await page.locator('#authSignIn').click();
  await page.locator('#authEmail').fill(email);
  await page.locator('#authPassword').fill(password);
  await page.locator('#authSubmit').click();
  await expect(page.locator('#appShell')).toBeVisible({ timeout: 15000 });
}

test.describe('WealthPilot Supabase RLS isolation', () => {
  test('User B cannot read User A portfolio through the client API', async ({ page }) => {
    test.skip(!emailA || !passwordA || !emailB || !passwordB,
      'Two E2E accounts are required: E2E_TEST_EMAIL/PASSWORD and E2E_TEST_EMAIL_2/PASSWORD_2');

    await signIn(page, emailA, passwordA);

    const portfolio = await page.evaluate(async () => {
      const existing = await listPortfolios();
      const testName = 'E2E-RLS-ISOLATION';
      const found = existing.find((item) => item.name === testName);
      return found || await createPortfolio(testName, 'INR');
    });

    expect(portfolio.name).toBe('E2E-RLS-ISOLATION');

    await page.locator('#accountBtn').click();
    await page.locator('#logoutBtn').click();
    await expect(page.locator('#publicGate')).toBeVisible({ timeout: 10000 });

    await signIn(page, emailB, passwordB);

    const isolation = await page.evaluate(async (portfolioId) => {
      const portfolios = await listPortfolios();
      const holdings = await listHoldings(portfolioId);
      return {
        portfolioVisible: portfolios.some((item) => item.id === portfolioId),
        holdingsVisible: holdings.length > 0
      };
    }, portfolio.id);

    expect(isolation.portfolioVisible).toBe(false);
    expect(isolation.holdingsVisible).toBe(false);
  });
});
