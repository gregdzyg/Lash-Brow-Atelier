package pl.atelierbypt.backend.exception;

public class OfferItemNotFoundException extends ResourceNotFoundException {
    public OfferItemNotFoundException(String message) {
        super(message);
    }
}
