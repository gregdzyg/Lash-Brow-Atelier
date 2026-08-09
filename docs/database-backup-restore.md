# Production database backup and restore

This runbook documents how AtelierByPT production backups are created and how
to verify that a backup can be recovered. A restore test must always target an
isolated Neon branch and an empty test database. Never restore a dump directly
into production.

## Backup workflow

The `Production database backup` GitHub Actions workflow runs daily at
02:17 UTC. Scheduled workflows can start later when GitHub Actions is busy.

The workflow:

1. creates a PostgreSQL custom-format dump with PostgreSQL 18.4;
2. verifies that `pg_restore` can read the archive;
3. encrypts the dump for the configured AGE recipient;
4. generates a SHA-256 checksum for the encrypted file;
5. uploads both files to the private Cloudflare R2 bucket
   `atelier-production-backups` under `daily/<UTC timestamp>/`;
6. verifies that both uploaded objects exist.

The private AGE identity is not stored in GitHub, R2 or the repository. It must
remain in the password manager controlled by the project owner. Losing this
identity makes the encrypted backups unrecoverable.

## Recovery test prerequisites

- access to the private R2 bucket;
- access to the private AGE identity;
- Docker Desktop;
- permission to create an isolated Neon branch and database;
- enough local disk space for the encrypted and decrypted backup.

The examples below use zsh on macOS. Replace the timestamp and downloaded file
name with the backup selected for the test.

## 1. Download and verify the backup

Download the `.dump.age` file and its matching `.sha256` file from the newest
successful `daily/` directory in R2.

Cloudflare can prefix downloaded file names with their R2 directory. Set the
actual local paths explicitly:

```zsh
ENCRYPTED_BACKUP="/absolute/path/to/downloaded-backup.dump.age"
CHECKSUM_FILE="/absolute/path/to/downloaded-backup.dump.age.sha256"

expected_hash="$(awk '{print $1}' "$CHECKSUM_FILE")"
actual_hash="$(shasum -a 256 "$ENCRYPTED_BACKUP" | awk '{print $1}')"

if [[ "$expected_hash" = "$actual_hash" ]]; then
  echo "SHA256_OK"
else
  echo "SHA256_MISMATCH"
  false
fi
```

Do not continue if the hashes differ.

## 2. Decrypt and inspect the archive

Create a temporary working directory:

```zsh
RESTORE_DIR="$(mktemp -d /private/tmp/atelier-restore.XXXXXX)"
DUMP_NAME="atelier-production-<UTC timestamp>.dump"
DECRYPTED_BACKUP="$RESTORE_DIR/$DUMP_NAME"
```

Copy the private AGE identity from the password manager and pass it through the
macOS clipboard. This keeps the identity out of shell history:

```zsh
pbpaste | age \
  --decrypt \
  --identity - \
  --output "$DECRYPTED_BACKUP" \
  "$ENCRYPTED_BACKUP"

printf '' | pbcopy
```

Inspect the custom-format archive with the same PostgreSQL tool version used by
the workflow:

```zsh
docker run --rm \
  -v "$RESTORE_DIR:/restore:ro" \
  postgres:18.4-alpine \
  pg_restore --list "/restore/$DUMP_NAME"
```

The command must finish without an error and list the expected tables, table
data, sequences, indexes, constraints and foreign keys.

## 3. Create an isolated Neon target

1. Create a temporary Neon branch named, for example,
   `restore-test-YYYY-MM-DD`.
2. On that branch create an empty database named `atelier_restore_test`.
3. Copy the direct, unpooled connection string for that database.
4. Confirm that the connection string names `atelier_restore_test`, not the
   production `neondb` database.

Read the connection string without adding it to shell history:

```zsh
printf 'Paste the isolated restore database connection string: '
IFS= read -rs RESTORE_DATABASE_URL
printf '\n'
export RESTORE_DATABASE_URL
```

## 4. Restore the dump

Restore into the empty test database as a single transaction:

```zsh
docker run --rm \
  -e RESTORE_DATABASE_URL \
  -v "$RESTORE_DIR:/restore:ro" \
  postgres:18.4-alpine \
  pg_restore \
    --dbname="$RESTORE_DATABASE_URL" \
    --no-owner \
    --no-privileges \
    --single-transaction \
    --exit-on-error \
    --verbose \
    "/restore/$DUMP_NAME"
```

Do not add `--clean` when the destination database is newly created and empty.
A non-zero exit code means the recovery test failed and must be investigated.

## 5. Verify recovered data

List restored tables:

```zsh
psql "$RESTORE_DATABASE_URL" -v ON_ERROR_STOP=1 -c '\dt'
```

Compare record counts with the expected production state without displaying
client details:

```zsh
psql "$RESTORE_DATABASE_URL" -v ON_ERROR_STOP=1 -c "
SELECT 'client' AS table_name, COUNT(*) FROM client
UNION ALL SELECT 'appointment', COUNT(*) FROM appointment
UNION ALL SELECT 'offer_item', COUNT(*) FROM offer_item
UNION ALL SELECT 'working_hours', COUNT(*) FROM working_hours
UNION ALL SELECT 'availability_exception', COUNT(*) FROM availability_exception
UNION ALL SELECT 'app_user', COUNT(*) FROM app_user;
"
```

Verify the Flyway history:

```zsh
psql "$RESTORE_DATABASE_URL" -v ON_ERROR_STOP=1 -c "
SELECT installed_rank, version, description, success
FROM flyway_schema_history
ORDER BY installed_rank;
"
```

The recovery test is successful only when the restore exits cleanly and the
expected schema, migrations and record counts are present.

## 6. Cleanup

After recording the result:

1. delete only the temporary Neon restore branch;
2. delete the decrypted dump immediately;
3. delete downloaded encrypted files when they are no longer needed;
4. clear sensitive shell variables and the clipboard;
5. keep the R2 source objects unchanged.

```zsh
rm -f "$DECRYPTED_BACKUP"
rmdir "$RESTORE_DIR"
rm -f "$ENCRYPTED_BACKUP" "$CHECKSUM_FILE"
printf '' | pbcopy
unset RESTORE_DATABASE_URL ENCRYPTED_BACKUP CHECKSUM_FILE
unset DECRYPTED_BACKUP DUMP_NAME RESTORE_DIR expected_hash actual_hash
```

Before deleting any Neon resource, confirm that its name begins with
`restore-test-` and that the production branch remains selected separately.

## Verified recovery

The automatic backup created on 2026-08-09 was downloaded from R2, verified
against its SHA-256 checksum, decrypted with the private AGE identity, inspected
with PostgreSQL 18.4 and restored successfully into an isolated Neon database.
