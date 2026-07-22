package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentRequest(

        @NotNull(message = "Wybór klienta jest wymagany.")
        Long clientId,

        @NotNull(message = "Wybór usługi jest wymagany.")
        Long offerItemId,

        @NotNull(message = "Data wizyty jest wymagana.")
        LocalDate appointmentDate,

        @NotNull(message = "Czas rozpoczęcia wizyty jest wymaganay.")
        LocalTime startTime,

        @Positive(message = "Czas trwania wizyty musi być dodatni.")
        Integer durationMinutes,

        @PositiveOrZero(message = "Cena nie może być ujemna.")
        BigDecimal price,

        @Size(max = 1000, message = "Notatka może zawirać maksymalnie 1000 znaków.")
        String note) {
}
