package pl.atelierbypt.backend.exception;

public class OfferItemNameConflictException extends BusinessConflictException {
    public OfferItemNameConflictException(String message) {
        super(message);
    }
}
