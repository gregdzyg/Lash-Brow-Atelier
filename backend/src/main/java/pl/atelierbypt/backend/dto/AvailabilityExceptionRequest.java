package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import pl.atelierbypt.backend.enums.AvailabilityExceptionType;

import java.time.LocalDate;
import java.time.LocalTime;

public record AvailabilityExceptionRequest(
        @NotNull(message = "Data wyjątku jest wymagana.")
        LocalDate date,

        LocalTime startTime,
        LocalTime endTime,

        @NotNull(message = "Typ wyjątku jest wymagany.")
        AvailabilityExceptionType type,

        @Size(max = 500, message = "Notatka może mieć maksymalnie 500 znaków.")
        String note
) {
}