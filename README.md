# AssetFlow

AssetFlow is a full-stack asset management platform for internal teams. It helps employees see what equipment and software they own, request new assets, open support tickets, and manage their account, while admins can oversee users, inventory, requests, and ticket workflows from a separate admin area.

This repository is published as a portfolio/demo application. The project is intended to be easy to clone, run, inspect, and discuss. The recommended way to explore it is through Docker so the full stack, seeded data, email sandbox, and database tooling all come up in a reproducible way.

## Live Demo

AssetFlow is available as a hosted demo:

- **Live app**: [https://asset-flow-web.vercel.app/](https://asset-flow-web.vercel.app/)
- **API health check**: [assetflow-ij5a](https://assetflow-ij5a.onrender.com)

Demo credentials:

- **Admin**: username `admin`, password `admin`
- **User**: username `user`, password `user`

The backend is currently deployed on free tier web service, so the first request after a period of inactivity can take up to a minute while the service wakes up.

## Environment Files

This repository uses three environment files:

- `/.env` for Docker Compose
- `/apps/api/.env` for local Nest API runs
- `/apps/web/.env` for local Nuxt runs

The split is deliberate:

- Docker reads only the root `.env`
- local API work reads `apps/api/.env`
- local web work reads `apps/web/.env`

## What The App Does

- Authenticates users with username/password and optional Google or GitHub OAuth.
- Lets employees browse assigned assets, submit asset requests, and open support tickets.
- Gives admins a separate dashboard to manage users, assets, requests, and support activity.
- Supports password recovery through email.
- Ships with local email testing through Mailpit and a ready-to-use Postgres database flow in Docker.

## Demo Credentials

After the seeded setup runs, you can sign in with:

- **Admin**: username `admin`, password `admin`
- **User**: username `user`, password `user`

These credentials work with the seeded demo data used by Docker and by the local `db:seed` flow.

## Technologies Used

### Frontend

- **Nuxt 4**: server-rendered Vue application and route-based frontend.
- **Vue 3**: component system and reactivity model.
- **Pinia**: client-side state management for auth and app data.
- **Tailwind CSS 4**: utility-first styling.
- **shadcn-nuxt + Reka UI**: UI primitives and reusable design-system style components.
- **Vue Sonner**: toast notifications and lightweight feedback.

### Backend

- **NestJS 11**: API framework and modular server architecture.
- **Prisma 7**: typed ORM and schema-driven database access.
- **PostgreSQL**: primary relational database.
- **Passport + JWT cookies**: authentication, protected routes, and OAuth integrations.
- **Nodemailer**: email transport used for password reset messages.

### Tooling And Infrastructure

- **Yarn 4 workspaces**: monorepo package management.
- **Docker Compose**: runs the full stack with one command.
- **Nginx**: reverse proxy that serves the web app and forwards `/api` traffic to the Nest API.
- **Mailpit**: local SMTP inbox for testing password reset flows.
- **pgAdmin**: optional database UI in the Docker stack.

## Recommended Setup: Docker

Docker is the recommended way to run AssetFlow. It gives you the closest setup to the intended full-stack environment and includes the database, reverse proxy, Mailpit, and pgAdmin out of the box.

### Why Docker Is Recommended

- It starts the full stack in one place.
- It includes PostgreSQL, Mailpit, and pgAdmin automatically.
- It uses the same proxy-based URL shape the app expects in production-like usage.
- It avoids local machine differences around database setup, ports, and email testing.
- It can auto-migrate and auto-seed the database when the DB is empty.

### Docker Setup

1. Install Docker Desktop.
2. From the repo root, copy the Docker env template:

```bash
cp .env.example .env
```

3. Fill in any values you need in `.env`.

Important variables:

- `JWT_SECRET`: cookie/JWT signing secret.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`: Google OAuth.
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`: GitHub OAuth.
- `NUXT_PUBLIC_GOOGLE_AUTH_ENABLED`, `NUXT_PUBLIC_GITHUB_AUTH_ENABLED`: controls whether social auth buttons appear. Leave them `false` until the matching OAuth credentials are configured.

JWT note:

- This repository intentionally ships the demo JWT secret `top_secret_jwt` in the example env files.
- That is done only because this project is currently treated as a test/demo application and the goal is zero-friction setup for reviewers.
- If the app is ever deployed to a real shared environment, replace it immediately.

4. Start the stack:

```bash
docker compose up --build -d
```

5. Open the services:

- App: [http://localhost:3000](http://localhost:3000)
- Mailpit inbox: [http://localhost:8025](http://localhost:8025)
- pgAdmin: [http://localhost:5050](http://localhost:5050)
- Postgres from host tools: `localhost:5433`

The Docker path is the recommended setup for reviewers because it is the least fragile and closest to the intended full-stack flow.

What works from the example config alone:

- Dockerized app boot
- Postgres + migrations
- automatic seed data
- username/password login
- password reset through Mailpit

What still needs user-specific credentials:

- Google OAuth
- GitHub OAuth
- any non-local email provider

Mailer note:

- The default Docker mailer is Mailpit.
- Mailpit does not require an SMTP username or password in this project.
- The only mail-related values a fresh clone needs are already present in `.env.example`: `MAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, and `SMTP_IGNORE_TLS`.

### How To Get The Missing OAuth Env Vars

The only intentionally missing values in the example Docker env are the social OAuth credentials:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

You get those values from the provider dashboards, not from this repository.

#### Google OAuth

1. Go to the Google Cloud Console Credentials page:
   [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Create or open an OAuth Client ID for a **Web application**.
3. Copy the client ID and client secret into the root `.env`.
4. Add the correct authorized values for the mode you are using.

For Docker mode:

- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/google/callback`

For local mode:

- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3333/auth/google/callback`

If your Google app is still in testing mode, add the Google accounts you want to use as test users on the OAuth consent screen.

Official references:

- [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
- [Google Cloud OAuth client setup flow](https://cloud.google.com/application-integration/docs/configure-authentication-profiles)

#### GitHub OAuth

1. Go to GitHub Developer Settings:
   [https://github.com/settings/developers](https://github.com/settings/developers)
2. Create or open an OAuth App.
3. Copy the client ID and client secret into the root `.env`.
4. Set the homepage URL and callback URL for the mode you are using.

For Docker mode:

- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/github/callback`

For local mode:

- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3333/auth/github/callback`

Important GitHub limitation:

- GitHub OAuth Apps only support a single callback URL.
- If you want both Docker mode and local direct-API mode, use separate GitHub OAuth apps or update the callback URL when you switch modes.

Official references:

- [GitHub OAuth app setup](https://docs.github.com/en/developers/apps/creating-an-oauth-app)
- [GitHub OAuth callback behavior](https://docs.github.com/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)

#### Where These Env Vars Go

- Docker mode:
  - put OAuth credentials in the root `.env`
  - put the frontend visibility flags in the root `.env`
- Local mode:
  - put OAuth credentials in `apps/api/.env`
  - put the frontend visibility flags in `apps/web/.env`

Frontend visibility flags:

- `NUXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`
- `NUXT_PUBLIC_GITHUB_AUTH_ENABLED=true`

Only turn the frontend flags on after the matching provider credentials are configured, otherwise the social buttons may appear without a working backend integration.

### Docker Command Reference

```bash
docker compose up --build -d
```

Builds images if needed and starts the full stack in the background.

```bash
docker compose logs -f
```

Streams container logs so you can inspect boot issues, API errors, or mail delivery activity.

```bash
docker compose down
```

Stops and removes the running containers but keeps the database volume.

```bash
docker compose down -v
```

Stops containers and also deletes named volumes, which resets the Postgres data.

## Local Setup

The local setup is useful if you want faster frontend/backend iteration without rebuilding containers, but it requires more manual setup and is less representative of the full deployed stack.
All local commands below are intended to be run from the repository root. The repo still uses Yarn for monorepo package management, but the local command surface is exposed through root scripts rather than package-scoped command invocations.

### Local Limitations Compared To Docker

- You must provide and manage your own local PostgreSQL instance.
- OAuth callback URLs differ from the Docker setup because local mode talks directly to the API on port `3333`.
- Mailpit is not automatically started unless you run it separately.
- You do not get the Nginx proxy behavior unless you add it yourself.

### Local Prerequisites

- Node.js 24
- Corepack-enabled Yarn 4.13.0
- PostgreSQL running locally
- Optional: Mailpit for local password reset email testing

### Local Node And Yarn Setup

This repository pins:

- Node.js `24.x`
- Yarn `4.13.0`

Recommended setup on a fresh clone:

```bash
corepack enable
corepack install
yarn install
```

If `corepack` is not available on your machine, install it first and then enable it:

```bash
npm install -g corepack
corepack enable
corepack install
yarn install
```

Important:

- Node.js `24.x` is the intended local version for this repository.
- Starting with Node.js `25`, Corepack is no longer bundled with Node by default, so a fresh machine may need the explicit `npm install -g corepack` step even if Node itself is already installed.

### Local Setup Steps

1. Install dependencies:

```bash
corepack enable
corepack install
yarn install
```

2. Copy the local env templates:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Do not reuse the root `.env` for local app execution. The root `.env` is only for Docker Compose.

3. Update the local env files.

For the API, the important values are in `apps/api/.env`:

- `DATABASE_URL`
- `FRONTEND_URL`
- `BACKEND_URL`
- `JWT_SECRET`
- SMTP or Mailpit settings
- Optional OAuth provider credentials

For this test/demo repository, the example API env already includes the shared demo JWT secret `top_secret_jwt` so a fresh clone can boot without inventing a secret first.

For the web app, the important values are in `apps/web/.env`:

- `NUXT_PUBLIC_API_BASE`
- `NUXT_API_BASE_SERVER`
- optional social-auth visibility flags, which should stay `false` until provider credentials are configured on the API side

4. Apply database migrations:

```bash
yarn api:db:migrate
```

5. Seed demo data if you want sample records:

```bash
yarn api:db:seed
```

6. Start both apps:

```bash
yarn dev
```

7. Open:

- Web app: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3333](http://localhost:3333)

### Local Command Reference

```bash
yarn dev
```

Starts the Nuxt app and the Nest API together from the repository root.

```bash
yarn api:dev
```

Starts only the Nest API in watch mode.

```bash
yarn web:dev
```

Starts only the Nuxt frontend.

```bash
yarn api:db:migrate
```

Applies existing Prisma migrations to the configured database.

```bash
yarn api:db:seed
```

Seeds the database with demo users, assets, tickets, and requests.

### Local Mailpit Option

If you want password reset emails locally without setting up a real SMTP provider, you can run just Mailpit:

```bash
docker compose up -d mailpit
```

Then use:

- SMTP: `localhost:1025`
- Inbox UI: [http://localhost:8025](http://localhost:8025)

Mailpit does not require SMTP credentials in this setup.

## Docker Vs Local At A Glance

- **Docker**: recommended for demos, onboarding, and realistic full-stack behavior.
- **Local**: better for quick code iteration when you already have Postgres and env management sorted out.
- **Docker** includes Postgres, Mailpit, pgAdmin, and proxy routing.
- **Local** gives you more direct control, but you have to wire the moving parts yourself.

## Notes

- Social login will only work when the provider credentials are valid **and** the provider dashboard redirect URLs match the mode you are using.
- Docker mode expects browser-facing callback URLs on `http://localhost:3000/api/.../callback`.
- Local mode usually expects direct API callback URLs on `http://localhost:3333/...`.
- The committed JWT secret is intentionally public for demo convenience only. It should be treated as non-production.

## Current Limitations

- Automated test coverage is still being built out and is not yet representative of the full application surface.
- OAuth login requires your own Google and GitHub app credentials; the repository does not ship real provider secrets.
- Mailpit is included for local/demo password reset testing only and is not a production mail solution.

## Testing Status

Testing is still a work in progress. Typechecking and builds are part of the current workflow, but the automated test suite and broader coverage are not fully stabilized yet.
