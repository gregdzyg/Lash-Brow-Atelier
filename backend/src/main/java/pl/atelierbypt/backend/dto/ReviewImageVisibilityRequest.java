package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.NotNull;

public record ReviewImageVisibilityRequest(
        @NotNull Boolean active
) {
}
