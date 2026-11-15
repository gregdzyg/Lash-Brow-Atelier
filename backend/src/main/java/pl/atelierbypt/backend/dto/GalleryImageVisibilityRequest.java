package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.NotNull;

public record GalleryImageVisibilityRequest(
        @NotNull Boolean active
) {
}
