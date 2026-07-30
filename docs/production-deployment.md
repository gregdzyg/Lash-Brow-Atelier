# Production deployment

This runbook keeps the public demo separate from the production environment.
Production accounts, billing and customer data should belong to the Atelier.

## Before the meeting

- Confirm whether any beta data needs to be migrated. Prefer a clean production
  database when the beta contains only fictional data.
- Keep the existing canonical public address:
  `https://www.atelierbypaula.pl`. The root domain should continue to redirect
  to `www`.
- Save screenshots or an export of the current DNS zone. In particular, preserve
  all mail-related `MX`, SPF, DKIM and DMARC records.
- Confirm that CI passes on the release commit and that the commit is available
  on the `main` branch.
- Keep the existing beta frontend, backend and database unchanged.

## Required access

The Atelier owner should have access to:

- the business email account;
- the HitMe domain and DNS panel;
- the current Vercel project, if available;
- a phone for two-factor authentication;
- the payment card used for production services.

Do not store passwords, database connection strings or JWT secrets in the
repository or this document.

## 1. Create the production Neon project

1. Create the project in the Atelier owner's Neon account.
2. Select a European region close to the Render backend.
3. Keep the production branch empty when beta data is only fictional.
4. Copy the pooled PostgreSQL connection details directly into Render later.
5. Open **Backup & Restore** and record the configured restore window.
6. Enable two-factor authentication and store recovery information securely.

The application applies Flyway migrations automatically when the backend starts.
The expected latest migration is `V12__restore_two_hour_public_start_interval.sql`.

## 2. Create the production backend on Render

Create a **Web Service** with these settings:

| Setting | Value |
| --- | --- |
| Repository | `gregdzyg/Lash-Brow-Atelier` |
| Branch | `main` |
| Region | Frankfurt |
| Root directory | `backend` |
| Runtime | Docker |
| Dockerfile | `./Dockerfile` |
| Instance | Starter paid instance |
| Health check path | `/api/public/working-hours` |

Configure the following environment variables:

| Variable | Initial value |
| --- | --- |
| `SPRING_DATASOURCE_URL` | Neon JDBC connection URL |
| `SPRING_DATASOURCE_USERNAME` | Neon database role |
| `SPRING_DATASOURCE_PASSWORD` | Neon database password |
| `JWT_SECRET` | New Base64 secret generated for production |
| `JWT_EXPIRATION` | `3600000` |
| `CORS_ALLOWED_ORIGIN` | `https://www.atelierbypaula.pl` |
| `ADMIN_BOOTSTRAP_ENABLED` | `true` for the first successful start only |
| `ADMIN_USERNAME` | Login agreed with the Atelier owner |
| `ADMIN_PASSWORD` | Strong initial password |
| `JPA_SHOW_SQL` | `false` |
| `SPRINGDOC_API_DOCS_ENABLED` | `false` |
| `SPRINGDOC_SWAGGER_UI_ENABLED` | `false` |
| `LOGIN_MAX_FAILED_ATTEMPTS` | `5` |
| `LOGIN_ATTEMPT_WINDOW_MINUTES` | `15` |
| `LOGIN_LOCK_DURATION_MINUTES` | `15` |

After the first successful deployment:

1. Confirm in the logs that all Flyway migrations completed.
2. Confirm that the administrator can log in.
3. Set `ADMIN_BOOTSTRAP_ENABLED=false`.
4. Remove `ADMIN_PASSWORD` from Render.
5. Keep `ADMIN_USERNAME` only if it is useful operationally; bootstrap no longer
   reads it while disabled.
6. Redeploy and verify that login still works.

## 3. Create the production frontend on Render

Create a **Static Site** with these settings:

| Setting | Value |
| --- | --- |
| Repository | `gregdzyg/Lash-Brow-Atelier` |
| Branch | `main` |
| Root directory | `frontend` |
| Build command | `npm ci && npm run build` |
| Publish directory | `dist` |

Add the build-time environment variable:

| Variable | Value |
| --- | --- |
| `VITE_API_URL` | Full HTTPS URL of the production backend |

Add the rewrite required by React Router:

| Source | Destination | Action |
| --- | --- | --- |
| `/*` | `/index.html` | Rewrite |

Deploy the site and test its temporary `onrender.com` address before changing
the public domain.

## 4. Verify before switching DNS

- Open all public routes directly and refresh them.
- Check the offer, working hours and public availability.
- Confirm that Google Maps is not loaded before consent.
- Log in and open every administration section.
- Create and archive one fictional client and appointment.
- Confirm Swagger and `/v3/api-docs` are unavailable.
- Check frontend console and backend logs.
- Verify the site on a phone.

## 5. Connect the public domain

1. Add the canonical domain to the production Render Static Site.
2. Copy the exact DNS values shown by Render.
3. In HitMe, change only the web records required by Render.
4. Do not remove or alter mail-related records.
5. Verify the domain in Render and wait for TLS issuance.
6. Configure the secondary `www` or root address to redirect to the canonical
   address.
7. Update `CORS_ALLOWED_ORIGIN` if the final canonical origin differs from the
   value used during verification.

## 6. Production smoke test

- Open every public route using the final domain.
- Refresh `/contact`, `/offer`, `/admin/login` and an authenticated admin route.
- Verify that HTTPS is active.
- Test login, logout and one invalid login.
- Confirm public availability for at least two service durations.
- Create and remove one fictional smoke-test appointment.
- Confirm the business mailbox still receives email.
- Recheck browser console and Render logs.

## Rollback

If the frontend fails after the DNS switch:

1. Restore the previous web DNS records saved before deployment.
2. Do not modify the mail records.
3. Keep the production backend and database running while the frontend issue is
   diagnosed.

If a backend deployment fails, use Render's previous successful deploy while
leaving the production database intact.

If a database migration or data operation causes a problem, do not repeatedly
restart or modify production. First inspect the failure, then restore into a
separate Neon branch and verify the recovered data before changing production.
