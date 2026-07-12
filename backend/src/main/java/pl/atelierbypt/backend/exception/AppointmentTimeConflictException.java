package pl.atelierbypt.backend.exception;

public class AppointmentTimeConflictException extends BusinessConflictException {
    public AppointmentTimeConflictException(String message) {
        super(message);
    }
}
