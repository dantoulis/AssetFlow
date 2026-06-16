# AssetFlow API

This package contains the NestJS backend for AssetFlow.

## What It Covers

- username/password authentication
- Google and GitHub OAuth flows
- JWT cookie-based session handling
- password reset email flow
- Gemini-backed AI dashboard brief endpoint
- users, assets, tickets, and asset request modules
- Prisma-based Postgres access

## Main Tech

- **NestJS 11** for the API structure
- **Prisma 7** for data access
- **PostgreSQL** as the database
- **Passport** for local and social auth strategies
- **Nodemailer** for outgoing email
- **Google Gemini API** for optional AI dashboard brief generation

## Useful Scripts

Run all commands below from the repository root.

```bash
yarn api:dev
```

Runs the API in watch mode.

```bash
yarn api:build
```

Builds the Nest app into `dist`.

```bash
yarn api:db:migrate
```

Applies database migrations.

```bash
yarn api:db:seed
```

Seeds demo data.

```bash
yarn api:typecheck
```

Runs TypeScript checks without emitting files.

## Local Env

Copy:

```bash
cp apps/api/.env.example apps/api/.env
```

Key variables:

- `DATABASE_URL`
- `FRONTEND_URL`
- `BACKEND_URL`
- `JWT_SECRET`
- `MAIL_FROM`
- SMTP settings
- optional OAuth credentials and callback URLs
- optional `GEMINI_API_KEY` and `GEMINI_MODEL`

For the default local Mailpit workflow, no SMTP username or password is required.
For this test/demo repository, `apps/api/.env.example` intentionally includes the shared demo JWT secret `top_secret_jwt` so the API can start immediately after cloning.

If `GEMINI_API_KEY` is not set, the AI endpoint returns a service-unavailable response while the rest of the API remains usable.

This package reads `apps/api/.env` during normal local development. The root `.env` is reserved for Docker Compose.

## Docker Note

When running through Docker Compose, the API reads its environment from the root `.env` file rather than `apps/api/.env`.

That Docker example env also intentionally uses the same public demo JWT secret because the project is currently optimized for demo/reviewer setup, not production secrecy.

## Testing Status

Automated testing for the API is still a work in progress.
