package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.NotNull;

public record QualificationVisibilityRequest(
        @NotNull(message = "Widoczność kwalifikacji jest wymagana.")
        Boolean active
) {
}
