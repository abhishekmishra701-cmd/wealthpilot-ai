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
