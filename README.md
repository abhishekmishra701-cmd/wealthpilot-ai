# WealthPilot AI V33.1 — Auth Flow Fix

Fixes the authentication mode-selection bug found during live QA.

Verified design:
- Separate Sign in and Create account controls
- Submit button text reflects selected mode
- Sign-in uses Supabase password authentication
- Create-account uses Supabase signup
- Handles email-verification-required response without falsely claiming login
- Existing V33 owner-scoped CRUD helpers retained

Release gate:
Actual signup/login/email-verification/session persistence still requires live browser E2E testing.
