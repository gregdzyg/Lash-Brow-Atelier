package pl.atelierbypt.backend.dto;

import java.util.List;

public record AdminQualificationSectionResponse(
        String eyebrow,
        String title,
        String description,
        List<AdminQualificationResponse> qualifications
) {
}
