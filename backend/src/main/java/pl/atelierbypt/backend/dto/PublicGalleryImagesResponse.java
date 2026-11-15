package pl.atelierbypt.backend.dto;

import java.util.List;

public record PublicGalleryImagesResponse(
        boolean configured,
        List<PublicGalleryImageResponse> images
) {
}
