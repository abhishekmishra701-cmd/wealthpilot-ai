# WealthPilot AI V33.6 — Auth Hardening + Premium Login

## Major fixes
- Single auth controller; legacy V33.2–V33.5 auth controllers removed.
- Supabase session is the single source of truth.
- Persistent session + automatic token refresh explicitly enabled.
- Protected dashboard is never rendered as the public state.
- Logout clears session and sensitive UI fields.
- Password is never written by the app to localStorage/sessionStorage.
- Sign-in uses `current-password`; account creation uses `new-password`.
- Inline OTP verification UI with 30-second resend cooldown.
- Password visibility toggle.
- Forgot-password email flow.
- More polished, responsive, security-first login experience.
- Account menu + secure logout retained.

## Required live QA
1. Incognito: dashboard hidden.
2. Correct password login: dashboard opens.
3. Refresh while logged in: session remains.
4. Close/reopen browser: session behavior matches intended product policy.
5. Logout: dashboard hides and auth form resets.
6. Direct URL after logout: dashboard stays hidden.
7. Wrong password: no dashboard.
8. OTP send + verify: dashboard opens only after valid OTP.
9. Resend cooldown works.
10. Forgot password email flow works.
11. No raw password appears in local/session storage.
12. RLS isolation tests pass before production sign-off.


## V33.7 E2E acceptance matrix

### Public / unauthenticated
- Fresh Incognito load → login screen only; no portfolio dashboard.
- Fresh normal-browser load with no valid Supabase session → login screen only.
- Direct dashboard URL after logout → login screen only.
- Refresh after logout → login screen remains.
- Back/forward navigation must not expose a protected dashboard.

### Tab isolation
- Enter email/password in Sign in → switch to Create account → all auth inputs reset.
- Enter email in Sign in → switch to OTP → email is blank.
- Enter email/OTP in OTP → switch to Sign in → OTP and email are blank.
- Switch repeatedly across all three tabs → no stale credentials/status/state leak.
- OTP panel is never visible in Sign in/Create account modes.

### Sign in
- Blank email → validation error; no network auth attempt.
- Invalid email format → validation error.
- Blank password → validation error.
- Password < 6 characters → validation error.
- Wrong password → dashboard remains hidden.
- Correct password → dashboard appears only after a real Supabase session exists.
- Refresh after successful sign-in → session is retained.
- Logout → session cleared, dashboard hidden, sensitive fields cleared.
- Double-click login → button disabled while request is in flight.

### Create account
- Blank/invalid email rejected.
- Weak/short password rejected.
- Existing account → Supabase error shown without exposing whether sensitive account details exist beyond provider response.
- New account with email confirmation enabled → confirmation message; dashboard stays locked until verified.
- Auto-confirmed account → dashboard opens only with returned authenticated session.

### OTP
- OTP field accepts digits only.
- Letters, symbols, pasted mixed text → non-digits removed.
- More than 6 digits → truncated.
- Fewer than 6 digits → verification blocked.
- Invalid 6-digit OTP → dashboard stays hidden.
- Valid OTP → dashboard opens only after authenticated session.
- Resend disabled before first OTP.
- Resend cooldown enforced.
- Switching tabs cancels OTP state.
- OTP value cleared after successful verification/logout.

### Password / browser behavior
- App never writes raw password to localStorage/sessionStorage.
- Password field is cleared on logout and tab changes.
- Login uses `current-password`; signup uses `new-password`.
- Browser password manager may still offer its own autofill/save UI; that is browser-controlled, not app storage.

### Session / security
- Supabase session is the only authorization state used by the UI.
- `persistSession` and `autoRefreshToken` enabled.
- Auth listener handles sign-in/sign-out/session changes.
- Dashboard is hidden by default and shown only after authenticated session.
- Portfolio database access must remain protected by Supabase RLS; UI hiding is not a security boundary.

### Regression
- Dashboard navigation still works after authenticated login.
- Portfolio/Goals/AI Advisor views remain accessible after login.
- Account menu opens/closes correctly.
- Logout works from account menu.
- No console errors on load, auth transitions, refresh, or logout.
- Desktop + mobile responsive layout checked.
