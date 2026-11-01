package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.NotNull;

public record NewsPostVisibilityRequest(
        @NotNull Boolean active
) {
}
