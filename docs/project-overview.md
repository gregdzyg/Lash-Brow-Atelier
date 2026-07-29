# Project overview

AtelierByPT is a management and scheduling system for an independent beauty
stylist.

The system consists of:

- a public React website presenting the atelier and its services;
- a public calendar showing backend-generated appointment suggestions;
- an authenticated administration panel;
- a Spring Boot REST API;
- a PostgreSQL database managed with Flyway migrations.

The administration panel manages clients, offer items, appointments, recurring
working hours and date-specific availability exceptions.

The key business module calculates real free time from weekly working hours,
exceptions and scheduled appointments. The same calculator is used for
appointment validation and both calendar views. The public API additionally
converts free time into preferred appointment starts and returns only those
that can contain the full duration of the service selected by the visitor.
The start-time grid is anchored independently at the beginning of each real
free range, so an appointment or block can begin a new sequence of suggestions.

The first stable release intentionally excludes database-managed gallery
content, editable qualifications and news. These features remain candidates
for post-release development.
