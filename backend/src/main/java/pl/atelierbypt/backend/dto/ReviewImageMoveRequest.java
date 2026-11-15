package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.NotNull;
import pl.atelierbypt.backend.enums.ReviewImageMoveDirection;

public record ReviewImageMoveRequest(
        @NotNull ReviewImageMoveDirection direction
) {
}
