# Zumwhere Rewards — Frontend

Next.js frontend for the Zumwhere Rewards back office. The first slice is the
username/password login screen and a protected placeholder welcome screen.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth with `@supabase/ssr`

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-publishable-or-anon-key
AUTH_EMAIL_DOMAIN=example.com
```

`SUPABASE_ANON_KEY` is the Supabase publishable/anon key. Never put the
service-role key in this app.

## Run

```bash
npm run dev
```

Open http://localhost:3000.

## Authentication

Supabase Auth uses email/password. New accounts are created with a username
and a synthetic address:

```text
username: demo
email: demo@example.com
```

Login accepts either the username or the full account email.

`example.com` is a reserved documentation domain used here as a synthetic
identity domain; it does not receive mail. Configure `AUTH_EMAIL_DOMAIN` if the
project later gets a dedicated domain.

Signup is username-only. It creates the Supabase Auth user with the synthetic
email and stores the username in user metadata.

### Email confirmation

Username accounts use synthetic addresses, so they cannot receive confirmation
emails. For self-serve signup, turn off **Confirm email** in
Supabase Dashboard → Authentication → Providers → Email. New signups will then
receive a session immediately.

If confirmation is enabled, account creation succeeds but the user must be
confirmed by an administrator before signing in.

Session handling:

- `lib/supabase/server.ts` creates the cookie-based server client.
- `proxy.ts` refreshes the session and protects `/welcome`.
- Login, signup, and logout are server actions in `app/actions/auth.ts`.
- `/welcome` verifies the user server-side before rendering.

## Routes

| Route | Behavior |
| --- | --- |
| `/` | Login screen; redirects to `/welcome` when signed in |
| `/signup` | Username/password signup; redirects to `/welcome` when signed in |
| `/welcome` | Protected placeholder welcome screen |

## Expected flow

1. Signed-out visitor sees the login screen at `/`.
2. The visitor can create a username/password account at `/signup`.
3. Invalid credentials show a generic error.
4. Valid credentials redirect to `/welcome`.
5. Refreshing `/welcome` keeps the session.
6. Signed-out access to `/welcome` redirects to `/`.
7. Sign-out clears the session and returns to `/`.
