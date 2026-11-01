package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.Size;

public record GalleryImageDetailsRequest(
        @Size(max = 255) String title,
        @Size(max = 500) String altText
) {
}
