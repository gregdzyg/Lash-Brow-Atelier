package pl.atelierbypt.backend.exception;

public class AppointmentNotFoundException extends ResourceNotFoundException {
    public AppointmentNotFoundException(String message) {
        super(message);
    }
}
