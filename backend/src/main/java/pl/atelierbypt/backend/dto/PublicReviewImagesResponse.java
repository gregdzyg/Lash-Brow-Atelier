package pl.atelierbypt.backend.dto;

import java.util.List;

public record PublicReviewImagesResponse(
        boolean configured,
        List<PublicReviewImageResponse> images
) {
}
