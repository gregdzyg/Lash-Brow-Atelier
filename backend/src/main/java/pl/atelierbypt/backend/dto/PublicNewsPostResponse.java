package pl.atelierbypt.backend.dto;

import pl.atelierbypt.backend.enums.NewsPostCategory;

import java.time.LocalDateTime;

public record PublicNewsPostResponse(
        Long id,
        String title,
        String content,
        NewsPostCategory category,
        String imageUrl,
        String imageAltText,
        LocalDateTime createdAt
) {
}
