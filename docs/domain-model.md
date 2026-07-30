# Domain model

## AppUser

Represents an administrator allowed to use the management panel.

Important fields:

- username
- password hash
- role
- active status

## Client

Represents a salon client.

Important fields:

- first and last name
- phone number
- email
- Instagram username
- internal notes
- active status

## OfferItem

Represents a service offered by the salon.

Important fields:

- name and description
- category
- default duration
- base price
- active status

## Appointment

Represents a booked salon visit and references both a client and an offer item.

Important fields:

- appointment date and start time
- duration and price captured for the individual visit
- status
- internal note
- active status

Supported statuses:

- `SCHEDULED`
- `CANCELLED`
- `NO_SHOW`

Appointment duration and price can override the current offer defaults. This
preserves the values agreed for a specific visit even when the offer later
changes.

`SCHEDULED` appointments can become `CANCELLED` or `NO_SHOW`. These terminal
statuses cannot be restored to `SCHEDULED`; a new appointment must be created
instead. An appointment that has already ended cannot be cancelled.

## WorkingHours

Represents the recurring schedule for one day of the week.

Important fields:

- day of week
- start and end time
- working-day flag
- interval between proposed public start times, in minutes
- active status

Exactly one active configuration is allowed for every weekday by a partial
unique database index. Working days must have a valid start and end time;
non-working days must not have either value.

## AvailabilityException

Represents a date-specific change to the recurring working schedule.

Supported types:

- `CLOSED_DAY` — closes the entire date;
- `BLOCKED` — removes a time range from availability;
- `EXTRA_OPEN` — adds an opening range.

## Shared fields

Persistent domain entities inherit an identifier, active status and creation
and update timestamps. Archival uses soft deletion so historical references
are not physically removed.
