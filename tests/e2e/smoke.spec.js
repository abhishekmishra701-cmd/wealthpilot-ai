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

  await page.locator('#authOtp').click();
  await expect(page.locator('#authOtp')).toHaveClass(/active/);
  await expect(page.locator('#authPassword')).toBeHidden();
  await expect(page.locator('#passwordLabel')).toBeHidden();
  // OTP entry is intentionally hidden until the OTP is successfully requested.
  await expect(page.locator('#otpArea')).toBeHidden();
  await expect(page.locator('#authSubmit')).toHaveText('Send OTP');

  await page.locator('#authSignIn').click();
  await expect(page.locator('#authSignIn')).toHaveClass(/active/);
  await expect(page.locator('#authPassword')).toBeVisible();
  await expect(page.locator('#forgotRow')).toBeVisible();
});

test('public page does not expose dashboard before authentication', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#appShell')).toBeHidden();
  await expect(page.locator('#publicGate')).toBeVisible();
});
