package pl.atelierbypt.backend.exception;

public class WorkingHoursNotFoundException extends ResourceNotFoundException {
    public WorkingHoursNotFoundException(String message) {
        super(message);
    }
}
