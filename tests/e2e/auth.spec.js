const { test, expect } = require('@playwright/test');

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;
const email2 = process.env.E2E_TEST_EMAIL_2;
const password2 = process.env.E2E_TEST_PASSWORD_2;

test.describe('WealthPilot authentication', () => {
  test('auth gate renders and all authentication modes are reachable', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#publicGate')).toBeVisible();
    await expect(page.locator('#authSignIn')).toBeVisible();
    await expect(page.locator('#authCreate')).toBeVisible();
    await expect(page.locator('#authOtp')).toBeVisible();

    await page.locator('#authCreate').click();
    await expect(page.locator('#authTitle')).toHaveText('Create your WealthPilot');
    await expect(page.locator('#authSubmit')).toHaveText('Create account');

    await page.locator('#authOtp').click();
    await expect(page.locator('#authTitle')).toHaveText('Sign in with email OTP');
    await expect(page.locator('#authSubmit')).toHaveText('Send OTP');
    await expect(page.locator('#otpArea')).toBeHidden();

    await page.locator('#authSignIn').click();
    await expect(page.locator('#authTitle')).toHaveText('Welcome back');
  });

  test('invalid password is handled without breaking the auth gate', async ({ page }) => {
    test.skip(!email, 'E2E_TEST_EMAIL secret is not configured');
    await page.goto('/');
    await page.locator('#authEmail').fill(email);
    await page.locator('#authPassword').fill('DefinitelyWrongPassword123!');
    await page.locator('#authSubmit').click();
    await expect(page.locator('#publicGate')).toBeVisible();
    await expect(page.locator('#authStatus')).not.toHaveText('Signed in successfully.');
  });

  test('valid credentials sign in, survive refresh, and logout', async ({ page }) => {
    test.skip(!email || !password, 'E2E_TEST_EMAIL/E2E_TEST_PASSWORD secrets are not configured');

    await page.goto('/');
    await page.locator('#authEmail').fill(email);
    await page.locator('#authPassword').fill(password);
    await page.locator('#authSubmit').click();

    await expect(page.locator('#appShell')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#publicGate')).toBeHidden();
    await expect(page.locator('#accountEmail')).toHaveText(email);

    await page.reload();
    await expect(page.locator('#appShell')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#publicGate')).toBeHidden();
    await expect(page.locator('#accountEmail')).toHaveText(email);

    await page.locator('#accountBtn').click();
    await expect(page.locator('#accountDropdown')).toBeVisible();
    await expect(page.locator('#accountEmailDropdown')).toHaveText(email);
    await page.locator('#logoutBtn').click();
    await expect(page.locator('#publicGate')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#appShell')).toBeHidden();
  });

  test('second test account can sign in independently and logout cleanly', async ({ page }) => {
    test.skip(!email2 || !password2, 'E2E_TEST_EMAIL_2/E2E_TEST_PASSWORD_2 secrets are not configured');

    await page.goto('/');
    await page.locator('#authEmail').fill(email2);
    await page.locator('#authPassword').fill(password2);
    await page.locator('#authSubmit').click();

    await expect(page.locator('#appShell')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#publicGate')).toBeHidden();
    await expect(page.locator('#accountEmail')).toHaveText(email2);

    await page.reload();
    await expect(page.locator('#appShell')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#accountEmail')).toHaveText(email2);

    await page.locator('#accountBtn').click();
    await expect(page.locator('#accountEmailDropdown')).toHaveText(email2);
    await page.locator('#logoutBtn').click();
    await expect(page.locator('#publicGate')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#appShell')).toBeHidden();
  });
});
