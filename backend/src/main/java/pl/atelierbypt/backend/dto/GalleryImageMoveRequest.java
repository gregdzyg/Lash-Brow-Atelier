package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.NotNull;
import pl.atelierbypt.backend.enums.GalleryImageMoveDirection;

public record GalleryImageMoveRequest(
        @NotNull GalleryImageMoveDirection direction
) {
}
