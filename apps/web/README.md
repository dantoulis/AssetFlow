# AssetFlow Web

This package contains the Nuxt frontend for AssetFlow.

## What It Covers

- public auth pages for login, register, forgot password, and reset password
- employee dashboard pages for assets, requests, tickets, profile, and account settings
- admin dashboard pages for users, assets, requests, tickets, and account management
- AI dashboard brief card for admin and employee dashboards
- SSR-friendly API access through configurable runtime URLs

## Main Tech

- **Nuxt 4** for the application shell and SSR
- **Vue 3** for components and reactivity
- **Pinia** for client state
- **Tailwind CSS 4** for styling
- **shadcn-nuxt + Reka UI** for reusable UI primitives

## Useful Scripts

Run all commands below from the repository root.

```bash
yarn web:dev
```

Runs the Nuxt app in development mode.

```bash
yarn web:build
```

Builds the production bundle.

```bash
yarn web:preview
```

Serves the production build locally after a build.

```bash
yarn web:typecheck
```

Runs Nuxt typechecks.

## Local Env

Copy:

```bash
cp apps/web/.env.example apps/web/.env
```

Key variables:

- `NUXT_PUBLIC_API_BASE`
- `NUXT_API_BASE_SERVER`
- `NUXT_PUBLIC_GOOGLE_AUTH_ENABLED`
- `NUXT_PUBLIC_GITHUB_AUTH_ENABLED`

This package reads `apps/web/.env` during normal local development. The root `.env` is reserved for Docker Compose.

The AI dashboard brief does not require web-specific environment variables. The frontend builds a bounded snapshot from already-fetched dashboard store data and sends it to the API, where Gemini configuration is handled.

## Docker Note

When running through Docker Compose, the web container reads its environment from the root `.env` file and expects the browser to access the app through the proxy on `http://localhost:3000`.

## Testing Status

Automated testing for the web app is still a work in progress.
