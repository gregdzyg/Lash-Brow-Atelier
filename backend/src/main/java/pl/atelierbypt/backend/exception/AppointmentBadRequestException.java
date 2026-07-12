package pl.atelierbypt.backend.exception;

public class AppointmentBadRequestException extends BadRequestException {
    public AppointmentBadRequestException(String message) {
        super(message);
    }
}
