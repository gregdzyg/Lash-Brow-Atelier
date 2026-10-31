package pl.atelierbypt.backend.dto;

public record PublicGalleryImageResponse(
        Long id,
        String imageUrl,
        String title,
        String altText
) {
}
