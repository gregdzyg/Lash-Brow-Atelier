package pl.atelierbypt.backend.dto;

import java.util.List;

public record QualificationSectionResponse(
        String eyebrow,
        String title,
        String description,
        List<QualificationResponse> qualifications
) {
}
