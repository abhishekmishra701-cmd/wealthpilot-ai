const { test, expect } = require('@playwright/test');

test('public auth gate is visible and has all authentication modes', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/WealthPilot AI/i);
  await expect(page.locator('#publicGate')).toBeVisible();
  await expect(page.locator('#authSignIn')).toBeVisible();
  await expect(page.locator('#authCreate')).toBeVisible();
  await expect(page.locator('#authOtp')).toBeVisible();
  await expect(page.locator('#authEmail')).toBeVisible();
});

test('authentication tabs switch cleanly', async ({ page }) => {
  await page.goto('/');

  await page.locator('#authCreate').click();
  await expect(page.locator('#authCreate')).toHaveClass(/active/);
  await expect(page.locator('#authPassword')).toBeVisible();
  await expect(page.locator('#passwordLabel')).toBeVisible();
  await expect(page.locator('#forgotRow')).toBeHidden();

  await page.locator('#authOtp').click();
  await expect(page.locator('#authOtp')).toHaveClass(/active/);
  await expect(page.locator('#authPassword')).toBeHidden();
  await expect(page.locator('#passwordLabel')).toBeHidden();
  await expect(page.locator('#otpArea')).toBeHidden();
  await expect(page.locator('#authSubmit')).toHaveText('Send OTP');
  await expect(page.locator('#forgotRow')).toBeHidden();

  await page.locator('#authSignIn').click();
  await expect(page.locator('#authSignIn')).toHaveClass(/active/);
  await expect(page.locator('#authPassword')).toBeVisible();
  await expect(page.locator('#forgotRow')).toBeVisible();
});

test('authentication client-side validation blocks incomplete sign-in', async ({ page }) => {
  await page.goto('/');

  await page.locator('#authSubmit').click();
  await expect(page.locator('#authStatus')).toHaveText('Enter your email address.');

  await page.locator('#authEmail').fill('not-an-email');
  await page.locator('#authSubmit').click();
  await expect(page.locator('#authStatus')).toHaveText('Enter a valid email address.');

  await page.locator('#authEmail').fill('test@example.com');
  await page.locator('#authPassword').fill('123');
  await page.locator('#authSubmit').click();
  await expect(page.locator('#authStatus')).toHaveText('Enter your password (minimum 6 characters).');
});

test('password visibility toggle works without changing the value', async ({ page }) => {
  await page.goto('/');
  const password = page.locator('#authPassword');
  const toggle = page.locator('#togglePassword');

  await password.fill('Secret123');
  await expect(password).toHaveAttribute('type', 'password');
  await toggle.click();
  await expect(password).toHaveAttribute('type', 'text');
  await expect(password).toHaveValue('Secret123');
  await expect(toggle).toHaveText('Hide');

  await toggle.click();
  await expect(password).toHaveAttribute('type', 'password');
  await expect(toggle).toHaveText('Show');
});

test('OTP input is sanitized to six digits', async ({ page }) => {
  await page.goto('/');
  await page.locator('#authOtp').click();

  await page.locator('#otpArea').evaluate((el) => {
    el.hidden = false;
    el.style.display = '';
  });

  const otp = page.locator('#otpCode');
  await otp.fill('12a34-56789');
  await otp.dispatchEvent('input');
  await expect(otp).toHaveValue('123456');
});

test('forgot-password action requires an email before calling the auth service', async ({ page }) => {
  await page.goto('/');
  await page.locator('#forgotPassword').click();
  await expect(page.locator('#authStatus')).toHaveText('Enter your email address first.');
});

test('public page does not expose dashboard before authentication', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#appShell')).toBeHidden();
  await expect(page.locator('#publicGate')).toBeVisible();
});
