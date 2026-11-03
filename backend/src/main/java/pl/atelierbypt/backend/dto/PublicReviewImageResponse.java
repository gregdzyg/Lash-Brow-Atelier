package pl.atelierbypt.backend.dto;

public record PublicReviewImageResponse(
        Long id,
        String imageUrl,
        String altText
) {
}
