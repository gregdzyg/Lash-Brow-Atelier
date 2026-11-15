package pl.atelierbypt.backend.dto;

public record GalleryImageResponse(
        Long id,
        String imageUrl,
        String title,
        String altText,
        Integer sortOrder,
        boolean isActive
) {
}
