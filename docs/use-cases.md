# Use cases

## Public visitor

- Browse the atelier website
- View the current offer and pricing
- View recurring working hours
- Check proposed appointment start times
- Read contact, privacy and terms information

The public calendar is informational. A visitor contacts the stylist to confirm
the final service and appointment duration.

## Administrator

### Authentication

- Log in to the protected administration panel
- Continue an authenticated session with a valid JWT
- Be redirected to login after authentication expires

### Clients

- List and search clients
- Create and edit a client
- View appointment history
- Archive a client

### Offer

- List services
- Create and edit a service
- Archive a service

### Appointments

- View daily and weekly calendars
- Create and edit an appointment
- Change appointment status
- Archive an appointment
- Reuse recently booked services for a client

An appointment must be in the future, remain within one calendar day, fit
opening hours, avoid blocks and not overlap another scheduled appointment.

### Availability

- Configure recurring working hours for all seven weekdays
- Configure the interval between public appointment suggestions
- Add a closed day
- Add a blocked time range
- Add extra opening hours

## Post-release candidates

- Manage gallery images
- Edit qualifications
- Publish news and announcements
