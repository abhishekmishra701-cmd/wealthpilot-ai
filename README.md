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


## V33.4 QA fix
- Added authenticated account menu to the top-right navigation.
- Added explicit "Log out securely" action.
- Logout is driven by Supabase `auth.signOut()`.
- After logout, the protected application shell is hidden.
- Auth state listener returns the user to the public gate when the session ends.
- Included `app.js` in the release bundle to avoid accidental omission during upload.

## Release gate
V33.4 is not complete until live tests pass:
1. Logged-in user sees account menu/email.
2. Logout clears session and hides dashboard.
3. Direct production URL after logout shows auth gate.
4. Browser refresh after logout remains gated.
5. Back navigation does not expose the protected shell.
