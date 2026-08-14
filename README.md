# WealthPilot AI V33 — Supabase CRUD Integration

Adds a real Supabase client using the project's publishable browser key, Auth helpers, and owner-scoped CRUD functions for:
- portfolios
- holdings
- transactions
- goals

The publishable key is safe for browser use when RLS is correctly configured. Service-role secrets are never included.

Important release gate:
- This package is prepared and statically validated.
- Real account sign-in, database CRUD, RLS isolation and email verification must be tested in the deployed browser before V33 is marked complete.
