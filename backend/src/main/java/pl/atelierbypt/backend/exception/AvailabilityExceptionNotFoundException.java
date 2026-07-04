package pl.atelierbypt.backend.exception;

public class AvailabilityExceptionNotFoundException extends ResourceNotFoundException {
    public AvailabilityExceptionNotFoundException(String message) {
        super(message);
    }
}
