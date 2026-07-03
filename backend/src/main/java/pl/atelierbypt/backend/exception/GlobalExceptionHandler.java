package pl.atelierbypt.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import pl.atelierbypt.backend.dto.error.ErrorResponse;
import pl.atelierbypt.backend.dto.error.FieldErrorResponse;
import pl.atelierbypt.backend.dto.error.ValidationErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException e,
                                                                         HttpServletRequest request) {

        HttpStatus status = HttpStatus.NOT_FOUND;
        ErrorResponse errorResponse = new ErrorResponse(status.value(), status.getReasonPhrase(),
        e.getMessage(), request.getRequestURI());

        return ResponseEntity.status(status).body(errorResponse);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException e, HttpServletRequest request) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        ValidationErrorResponse errorResponse = new ValidationErrorResponse(status.value(), status.getReasonPhrase(),
                request.getRequestURI(), e.getBindingResult()
                .getFieldErrors().stream()
                .map(fieldError ->
                new FieldErrorResponse(fieldError.getField(), fieldError.getDefaultMessage())).toList());
        return ResponseEntity.status(status).body(errorResponse);
    }

    @ExceptionHandler(BusinessConflictException.class)
    public ResponseEntity<ErrorResponse> handleBusinessConflictException(BusinessConflictException e,
                                                                         HttpServletRequest request) {
        HttpStatus status = HttpStatus.CONFLICT;
        ErrorResponse errorResponse = new ErrorResponse(status.value(), status.getReasonPhrase(),
                e.getMessage(), request.getRequestURI());

        return ResponseEntity.status(status).body(errorResponse);
    }
}
