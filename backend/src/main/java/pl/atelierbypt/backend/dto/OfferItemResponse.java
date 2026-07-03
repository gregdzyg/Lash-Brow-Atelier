package pl.atelierbypt.backend.dto;

import pl.atelierbypt.backend.enums.OfferItemCategory;

import java.math.BigDecimal;

public record OfferItemResponse(
        Long id,
        String name,
        OfferItemCategory category,
        String description,
        Integer durationMinutes,
        BigDecimal basePrice,
        boolean isActive
) {
}
