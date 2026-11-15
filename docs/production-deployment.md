# Production deployment

This runbook keeps the public demo separate from the production environment.
Production accounts, billing and customer data should belong to the Atelier.

## Before the meeting

- Keep the existing production Neon database. It contains live business data
  and must never be replaced with the demo database.
- Confirm that the newest encrypted production backup completed successfully
  before the release.
- Record non-sensitive control counts for the existing production tables and
  confirm that Flyway has successfully applied migrations through `V12`.
- Keep the existing canonical public address:
  `https://www.atelierbypaula.pl`. The root domain should continue to redirect
  to `www`.
- Save screenshots or an export of the current DNS zone. In particular, preserve
  all mail-related `MX`, SPF, DKIM and DMARC records.
- Confirm that CI passes on the release commit.
- Finalise the privacy policy and merge the accepted release from the permanent
  `demo` branch into `main`.
- Add an `X-Robots-Tag: noindex, nofollow` response header for `/*` on the demo
  Static Site so search engines do not index it as a duplicate of production.
- Keep the existing beta frontend, backend and database unchanged.

## Required access

The Atelier owner should have access to:

- the business email account;
- the HitMe domain and DNS panel;
- a phone for two-factor authentication;
- the payment card used for production services.

Do not store passwords, database connection strings or JWT secrets in the
repository or this document.

## 1. Verify the existing production database

1. Confirm that the Render production backend still points to the existing
   production Neon database, not the demo database.
2. Confirm that the newest encrypted backup exists in the private R2 backup
   bucket and that the backup workflow succeeded.
3. Read `flyway_schema_history` and confirm that all existing migrations through
   `V12__restore_two_hour_public_start_interval.sql` succeeded.
4. Record counts for `client`, `appointment`, `offer_item`, `working_hours`,
   `availability_exception` and `app_user`. Do not display client details.
5. Do not manually create the new tables. Flyway will add migrations `V13`
   through `V18` when the new backend starts.

The new migrations only add tables and seed public website content. They do not
delete or alter existing clients, appointments, offers, working hours,
availability exceptions or administrator accounts.

## 2. Prepare production media storage

1. Create a dedicated public R2 bucket for production media, for example
   `atelier-production-media`. Do not use the private production backup bucket
   or the demo media bucket.
2. Create an API token limited to read and write access for the production media
   bucket.
3. Enable the bucket's public development URL or connect its public custom
   domain.
4. Upload one harmless test image and open the exact public object URL before
   configuring Render. Remove the test object afterwards.
5. Store the token values only in Render and the owner's password manager.

## 3. Update the production backend on Render

Verify the existing **Web Service** uses these settings:

| Setting | Value |
| --- | --- |
| Repository | `gregdzyg/Lash-Brow-Atelier` |
| Branch | `main` |
| Region | Frankfurt |
| Root directory | `backend` |
| Runtime | Docker |
| Dockerfile | `./Dockerfile` |
| Instance | Starter paid instance |
| Health check path | `/api/public/health` |

Configure the following environment variables:

| Variable | Initial value |
| --- | --- |
| `SPRING_DATASOURCE_URL` | Neon JDBC connection URL |
| `SPRING_DATASOURCE_USERNAME` | Neon database role |
| `SPRING_DATASOURCE_PASSWORD` | Neon database password |
| `JWT_SECRET` | Existing production JWT secret |
| `JWT_EXPIRATION` | `3600000` |
| `CORS_ALLOWED_ORIGIN` | `https://www.atelierbypaula.pl` |
| `ADMIN_BOOTSTRAP_ENABLED` | `false` because the production administrator already exists |
| `JPA_SHOW_SQL` | `false` |
| `SPRINGDOC_API_DOCS_ENABLED` | `false` |
| `SPRINGDOC_SWAGGER_UI_ENABLED` | `false` |
| `LOGIN_MAX_FAILED_ATTEMPTS` | `5` |
| `LOGIN_ATTEMPT_WINDOW_MINUTES` | `15` |
| `LOGIN_LOCK_DURATION_MINUTES` | `15` |
| `R2_ENABLED` | `true` |
| `R2_ENDPOINT` | Cloudflare R2 S3 API endpoint |
| `R2_ACCESS_KEY_ID` | Production media token access key ID |
| `R2_SECRET_ACCESS_KEY` | Production media token secret access key |
| `R2_BUCKET` | Production media bucket name |
| `R2_PUBLIC_BASE_URL` | Exact public base URL for objects in the production media bucket |

After the backend deployment:

1. Confirm in the logs that Flyway applied migrations `V13` through `V18`.
2. Confirm that the administrator can log in.
3. Confirm that existing appointments, offers and working hours remain present.
4. Keep `ADMIN_USERNAME` and `ADMIN_PASSWORD` absent from Render. The existing
   administrator account remains in the database.

## 4. Update the production frontend on Render

Verify the existing **Static Site** uses these settings:

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

## 5. Controlled deployment and verification

1. Temporarily disable automatic frontend deployment.
2. Merge the accepted `demo` branch into `main` and wait for CI to pass.
3. Deploy the backend first. The existing frontend remains compatible with the
   updated backend.
4. Confirm in the backend logs that Flyway applied migrations `V13` through
   `V18` successfully.
5. Compare the control counts for the existing production tables with the
   counts recorded before deployment.
6. Check login, appointments, the offer and working hours before continuing.
7. Deploy the frontend and re-enable its normal deployment setting only after
   the backend checks pass.

Until the first gallery record is added, the frontend displays the bundled
gallery images. Adding the first image through the administration panel switches
the public gallery to database and R2 content. The stylist should therefore add
the complete initial gallery in one session.

## 6. Verify before switching DNS

- Open all public routes directly and refresh them.
- Check the offer, working hours and public availability.
- Confirm that Google Maps is not loaded before consent.
- Log in and open every administration section.
- Create and archive one fictional client and appointment.
- Confirm Swagger and `/v3/api-docs` are unavailable.
- Check frontend console and backend logs.
- Verify the site on a phone.

## 7. Connect the public domain

1. Add the canonical domain to the production Render Static Site.
2. Copy the exact DNS values shown by Render.
3. In HitMe, change only the web records required by Render.
4. Do not remove or alter mail-related records.
5. Verify the domain in Render and wait for TLS issuance.
6. Configure the secondary `www` or root address to redirect to the canonical
   address.
7. Update `CORS_ALLOWED_ORIGIN` if the final canonical origin differs from the
   value used during verification.

## 8. Production smoke test

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
Follow the [backup and restore runbook](database-backup-restore.md); never test
recovery against the production database.

## Branch ownership after release

| Branch | Render environment | Owner | Data |
| --- | --- | --- | --- |
| `demo` | existing demo frontend and backend | developer | fictional |
| `main` | production frontend and backend | Atelier | real |

Future work should be developed on `feature/*`, tested on `demo`, and promoted
to `main` only after acceptance. Merging does not delete a branch; remove the
temporary release branch only after both permanent branches and Render
connections have been verified.
