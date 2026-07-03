package pl.atelierbypt.backend.exception;

public class PhoneNumberConflictException extends BusinessConflictException {
    public PhoneNumberConflictException(String message) {
        super(message);
    }
}
