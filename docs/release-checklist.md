# Release checklist

This checklist covers the first stable AtelierByPT release.

## 1. Beta verification

- [ ] Confirm the latest backend and frontend deployments completed successfully.
- [ ] Confirm Flyway applied every migration, including V11.
- [ ] Refresh `/contact`, `/admin/login` and an authenticated admin route directly.
- [ ] Confirm the Render rewrite `/*` → `/index.html` is enabled.
- [ ] Test login after the backend has been idle.
- [ ] Confirm invalid or expired authentication returns JSON `401`.

## 2. Availability regression

- [ ] Set a weekday to working hours 08:00–17:00 and “Terminy co” to 60 minutes.
- [ ] Select a 120-minute service and confirm the last proposed start is 15:00.
- [ ] Change the interval to 90 minutes and confirm the public starts are spaced by 90 minutes.
- [ ] Leave only 15:00–16:00 free and confirm it is shown for a 60-minute service.
- [ ] Confirm the same 15:00 start is hidden for a service longer than 60 minutes.
- [ ] Add a `BLOCKED` period and confirm overlapping suggestions disappear.
- [ ] Add a `CLOSED_DAY` and confirm the day has no suggestions.
- [ ] Add `EXTRA_OPEN` on a non-working day and confirm suggestions are generated.
- [ ] Create a scheduled appointment and confirm it disappears from public availability.
- [ ] Cancel the appointment and confirm the time becomes available again.
- [ ] Confirm daily and weekly admin calendars show the same free time.

## 3. Core administration regression

- [ ] Create, edit and archive a fictional client.
- [ ] Create, edit and archive a service.
- [ ] Create, edit, cancel and archive an appointment.
- [ ] Confirm an appointment outside opening hours is rejected.
- [ ] Confirm an appointment overlapping a block is rejected.
- [ ] Confirm an appointment overlapping another scheduled appointment is rejected.
- [ ] Verify the main panel flows on a mobile viewport.

## 4. User acceptance

- [ ] Give the stylist a short scenario list instead of an open-ended test request.
- [ ] Record every issue with steps to reproduce, expected result and actual result.
- [ ] Classify issues as blocking, important or cosmetic.
- [ ] Resolve all blocking and important issues before production.
- [ ] Obtain explicit approval for the first stable release.

## 5. Data and privacy

- [ ] Confirm which environment contains fictional data and which can contain real data.
- [ ] Remove accidental demo records and unrealistic service durations.
- [ ] Confirm who has access to Render and the PostgreSQL provider.
- [ ] Create or verify a recent database backup.
- [ ] Document the restore procedure and perform a test restore if possible.
- [ ] Agree on deletion or anonymisation of former client data.
- [ ] Confirm the privacy policy matches the data actually stored.

## 6. Production configuration

### Backend

- [ ] Use a strong, unique Base64 `JWT_SECRET`.
- [ ] Set `ADMIN_BOOTSTRAP_ENABLED=false` after administrator creation.
- [ ] Set `JPA_SHOW_SQL=false`.
- [ ] Set `SPRINGDOC_API_DOCS_ENABLED=false`.
- [ ] Set `SPRINGDOC_SWAGGER_UI_ENABLED=false`.
- [ ] Set `CORS_ALLOWED_ORIGIN` to the exact production frontend origin.
- [ ] Confirm the production database connection uses TLS where supported.

### Frontend

- [ ] Set `VITE_API_URL` to the production backend URL.
- [ ] Configure EmailJS values if the contact form is enabled.
- [ ] Configure the SPA rewrite `/*` → `/index.html`.
- [ ] Confirm custom-domain HTTPS and canonical URLs.

## 7. Repository release

- [ ] Push the release-readiness branch.
- [ ] Confirm GitHub Actions is green.
- [ ] Review the pull request and its changed files.
- [ ] Merge the accepted 2.0 version into `main`.
- [ ] Confirm `main` is the repository default branch.
- [ ] Update the repository description and demo link.
- [ ] Create the `v1.0.0` tag after successful production deployment.

## 8. Production smoke test

- [ ] Open every public navigation route.
- [ ] Check public offer, working hours and availability.
- [ ] Log in and open every main admin section.
- [ ] Create and remove one fictional smoke-test appointment.
- [ ] Check browser console and backend logs.
- [ ] Verify the site on a phone.

## 9. First days after release

- [ ] Review backend errors and failed login attempts daily.
- [ ] Confirm backups continue to run.
- [ ] Ask the stylist for problems observed during real work.
- [ ] Fix release regressions before starting new features.
- [ ] Move non-critical improvements to a post-release backlog.
