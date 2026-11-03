package pl.atelierbypt.backend.dto;

public record ReviewImageResponse(
        Long id,
        String imageUrl,
        String altText,
        Integer sortOrder,
        boolean active
) {
}
