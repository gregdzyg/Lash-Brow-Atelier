package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.Size;

public record ReviewImageDetailsRequest(
        @Size(max = 500) String altText
) {
}
