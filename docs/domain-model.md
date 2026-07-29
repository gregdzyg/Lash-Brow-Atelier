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

## WorkingHours

Represents the recurring schedule for one day of the week.

Important fields:

- day of week
- start and end time
- working-day flag
- public slot interval in minutes
- active status

Exactly one active configuration is expected for every weekday.

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
