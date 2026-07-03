package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.*;
import pl.atelierbypt.backend.enums.OfferItemCategory;

import java.math.BigDecimal;

public record OfferItemRequest(

        @NotBlank(message = "Nazwa usługi nie może być pusta.")
        String name,

        @NotNull(message = "Kategoria nie może być pusta.")
        OfferItemCategory category,

        @Size(max = 1000, message = "Opis usługi nie może przekraczać 1000 znaków.")
        String description,

        @Positive(message = "Czas trwania usługi musi być większy od zera.")
        @NotNull(message = "Czas trwania usługi jest wymagany.")
        Integer durationMinutes,

        @NotNull(message = "Podstawowa cena usługi jest wymagana.")
        @DecimalMin(value = "0.00", message = "Cena nie może być ujemna.")
        BigDecimal basePrice

) {
}
