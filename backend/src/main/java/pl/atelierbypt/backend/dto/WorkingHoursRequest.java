package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record WorkingHoursRequest(
        LocalTime startTime,
        LocalTime endTime,

        @NotNull(message = "Informacja, czy dzień jest pracujący, jest wymagana.")
        Boolean isWorkingDay
) {
}
