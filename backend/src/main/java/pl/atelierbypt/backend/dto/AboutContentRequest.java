package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AboutContentRequest(
        @NotBlank(message = "Opis Atelier na stronie głównej nie może być pusty.")
        @Size(max = 5000, message = "Opis Atelier nie może przekraczać 5000 znaków.")
        String homeIntroduction,

        @NotBlank(message = "Opis na stronie O mnie nie może być pusty.")
        @Size(max = 5000, message = "Opis na stronie O mnie nie może przekraczać 5000 znaków.")
        String aboutBiography
) {
}
