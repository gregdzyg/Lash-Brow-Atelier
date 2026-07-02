package pl.atelierbypt.backend.dto.error;

import java.util.List;

public record ValidationErrorResponse(int status, String error, String path, List<FieldErrorResponse> fieldErrors) {
}
