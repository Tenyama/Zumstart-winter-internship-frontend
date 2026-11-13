# Zumwhere Rewards — Frontend

Next.js frontend for the Zumwhere Rewards back office. The first slice is
username/email login and the Program configuration page.

Accounts are admin-provisioned. The frontend does not offer public sign-up.

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
API_URL=http://127.0.0.1:8000
```

`SUPABASE_ANON_KEY` is the Supabase publishable/anon key. Never put the
service-role key in this app.

`API_URL` points to the FastAPI rewards backend. The backend is called only
from server-side code and does not require an API key for this slice.

## Run

```bash
npm run dev
```

Open http://localhost:3000.

## Authentication and access

Supabase Auth uses email/password. Accounts are created and confirmed by an
administrator in Supabase. The login form accepts either a username or the
full account email:

```text
username: demo
email: demo@example.com
```

`example.com` is a reserved documentation domain used as a synthetic identity
domain; it does not receive mail.

Access is resolved from the authenticated user:

- `staff_users.user_id` links the Auth user to a merchant.
- `staff_users.role` is `owner`, `admin`, or `staff`.
- A custom access token hook injects `merchant_id`, `staff_role`, and
  `staff_user_id` into the JWT.
- The frontend reads those claims with `supabase.auth.getClaims()`.
- The claim's `merchant_id` decides which merchant the signed-in account
  operates as. There is no program selector and no merchant env variable.
- Only `owner` and `admin` can open or change the Program configuration.
  Users without an active staff link see “No merchant access”; other roles see
  “Rewards access required”.

There is no public sign-up. `/signup` is an informational page that directs
users to their administrator.

Session handling:

- `lib/supabase/server.ts` creates the cookie-based server client.
- `proxy.ts` refreshes the session and protects `/program`.
- `lib/auth/auth-context.ts` resolves the merchant/role from verified claims.
- `app/actions/auth.ts` handles login and logout.

## Program configuration

`/program` implements the Program tab from the wireframe:

- program name and terms
- earn rate and rounding policy
- points expiry, including “never”
- max points per order and max earning orders per day
- manual-adjustment approval threshold
- active/paused status controls

The page calls the rewards API through server-side helpers. It resolves the
merchant from the signed-in account's claims, fetches that merchant's program,
creates it when missing, and updates it through `PATCH`.

The backend stays unauthenticated for this slice. Access control for the
Program page and its server actions is enforced in the frontend using the
`owner`/`admin` role claim. Do not treat the public backend URL as a security
boundary.

Channels, voucher stacking, excluded items, and outlet scope are shown in a
disabled “not yet available” section because the current API does not expose
those fields.

## Vercel deployment

The frontend and backend are separate Vercel projects that talk
server-to-server. The browser never calls the backend directly.

### Backend project

- Root directory: `backend`
- Vercel auto-detects the FastAPI `app` in `backend/app/main.py`.
- `backend/vercel.json` sets the function duration.

Environment variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=<service-role-key>
```

Do not expose `SUPABASE_KEY` to the frontend.

### Frontend project

- Root directory: `frontend`

Environment variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=<publishable-or-anon-key>
AUTH_EMAIL_DOMAIN=example.com
API_URL=https://your-backend.vercel.app
```

`API_URL` is server-only; do not prefix it with `NEXT_PUBLIC_`.

The frontend calls the backend from server actions and Server Components. No
CORS configuration is required. If the browser ever needs to call the backend
directly, route it through a Next.js route handler.

Set the Supabase Auth Site URL to the frontend Vercel URL.

## Routes

| Route | Behavior |
| --- | --- |
| `/` | Login screen; redirects to `/program` when signed in |
| `/signup` | Admin-provisioned account notice |
| `/program` | Protected rewards Program configuration page |
| `/welcome` | Redirects to `/program` |

## Expected flow

1. Signed-out visitor sees the login screen at `/`.
2. An administrator creates the Supabase Auth user and links a `staff_users` row.
3. Invalid credentials show a generic error.
4. Valid credentials redirect to `/program`.
5. The account's claims resolve the merchant, and only that merchant's program
   is shown.
6. Refreshing `/program` keeps the session and reloads the program.
7. Signed-out access to `/program` redirects to `/`.
8. Program settings can be saved, and the program can be paused/resumed.
9. Sign-out clears the session and returns to `/`.
