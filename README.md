# WealthPilot AI V33.3 — Authentication Gate

Critical QA fix from live testing.

## Fixed
- Dashboard/portfolio content is hidden for unauthenticated visitors.
- Public state shows only the WealthPilot branding + authentication card.
- Successful Supabase password login, signup-with-session, or OTP verification reveals the app.
- Authenticated session loss returns the user to the public gate.
- Prevents demo portfolio values from appearing to an unauthenticated user.
- Auth status remains tied to the actual Supabase session.

## Release gate
Do not mark V33.3 complete until live browser testing proves:
1. Fresh/incognito visitor sees no portfolio data.
2. Wrong credentials do not reveal the dashboard.
3. Correct credentials reveal the dashboard.
4. Logout hides the dashboard again.
5. Refresh while authenticated preserves access.
6. Refresh while signed out keeps the dashboard hidden.
7. OTP login reveals the dashboard only after successful verification.
