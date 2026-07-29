package pl.atelierbypt.backend.service.availability;

public enum AvailabilityStatus {
    AVAILABLE,
    CLOSED_DAY,
    OUTSIDE_OPENING_HOURS,
    BLOCKED,
    APPOINTMENT_CONFLICT
}
