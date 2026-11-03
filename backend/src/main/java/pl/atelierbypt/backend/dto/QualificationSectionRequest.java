package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record QualificationSectionRequest(
        @NotBlank(message = "Mały nagłówek sekcji nie może być pusty.")
        @Size(max = 100, message = "Mały nagłówek nie może przekraczać 100 znaków.")
        String eyebrow,

        @NotBlank(message = "Tytuł sekcji nie może być pusty.")
        @Size(max = 255, message = "Tytuł sekcji nie może przekraczać 255 znaków.")
        String title,

        @NotBlank(message = "Opis sekcji nie może być pusty.")
        @Size(max = 1000, message = "Opis sekcji nie może przekraczać 1000 znaków.")
        String description
) {
}
