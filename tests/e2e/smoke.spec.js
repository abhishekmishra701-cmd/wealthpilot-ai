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
  await page.locator('#authOtp').click();
  await expect(page.locator('#authOtp')).toHaveClass(/active/);
  await expect(page.locator('#otpArea')).toBeVisible();
  await expect(page.locator('#authPassword')).toBeHidden();
  await page.locator('#authSignIn').click();
  await expect(page.locator('#authSignIn')).toHaveClass(/active/);
});

test('public page does not expose dashboard before authentication', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#appShell')).toBeHidden();
  await expect(page.locator('#publicGate')).toBeVisible();
});
