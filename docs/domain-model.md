# Domain Model

## User

Represents the salon owner or administrator who can log in to the admin panel.

Fields:
- id
- email
- passwordHash
- role
- isActive
- createdAt
- updatedAt

## Client

Represents a salon client.

Fields:
- id
- firstName
- lastName
- phoneNumber
- email
- instagramUsername
- notes
- isActive
- createdAt
- updatedAt

## OfferItem

Represents a beauty service offered by the salon.

Fields:
- id
- name
- description
- durationMinutes
- basePrice
- category
- isActive
- createdAt
- updatedAt

## Appointment

Represents a booked visit in the salon calendar.

Fields:
- id
- client
- offerItem
- appointmentDate
- startTime
- durationMinutes
- price
- status
- note
- isActive
- createdAt
- updatedAt

Possible statuses:
- SCHEDULED
- CANCELLED
- NO_SHOW

## GalleryItem

Represents an image displayed in the public gallery.

Fields:
- id
- title
- description
- imageUrl
- displayOrder
- isVisible
- createdAt
- updatedAt

## PageContent

Represents editable text content displayed on the public website.

Fields:
- id
- sectionKey
- title
- content
- isVisible
- updatedAt

## BusinessSettings

Represents global salon settings.

Fields:
- id
- salonName
- phoneNumber
- email
- address
- instagramUrl
- facebookUrl
- tiktokUrl
- workingHours
- slotIntervalMinutes

## WorkingHours

Represents standard weekly worktime,
a repeatable weekly schema

Fields:
- id
- dayOfWeek
- startTime
- endTime
- isWorkingDay
- isActive
- createdAt
- updatedAt