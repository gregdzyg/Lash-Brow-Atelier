package pl.atelierbypt.backend.dto;

public record AdminQualificationResponse(
        Long id,
        String title,
        String description,
        Integer sortOrder,
        boolean active
) {
}
