package pl.atelierbypt.backend.exception;

public class PhoneNumberConflictException extends RuntimeException {
    public PhoneNumberConflictException(String message) {
        super(message);
    }
}
