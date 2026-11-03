package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record QualificationRequest(
        @NotBlank(message = "Nazwa kwalifikacji nie może być pusta.")
        @Size(max = 255, message = "Nazwa kwalifikacji nie może przekraczać 255 znaków.")
        String title,

        @NotBlank(message = "Opis kwalifikacji nie może być pusty.")
        @Size(max = 1000, message = "Opis kwalifikacji nie może przekraczać 1000 znaków.")
        String description
) {
}
