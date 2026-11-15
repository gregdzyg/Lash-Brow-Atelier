package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import pl.atelierbypt.backend.enums.NewsPostCategory;

public record NewsPostDetailsRequest(
        @NotBlank(message = "Tytuł wpisu nie może być pusty.")
        @Size(max = 255, message = "Tytuł wpisu nie może przekraczać 255 znaków.")
        String title,

        @NotBlank(message = "Treść wpisu nie może być pusta.")
        String content,

        @NotNull(message = "Kategoria wpisu jest wymagana.")
        NewsPostCategory category
) {
}
