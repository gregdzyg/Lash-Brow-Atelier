package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record WorkingHoursRequest(
        LocalTime startTime,
        LocalTime endTime,

        @NotNull(message = "Informacja, czy dzień jest pracujący, jest wymagana.")
        Boolean isWorkingDay,

        @NotNull(message = "Długość publicznego slotu jest wymagana.")
        @Min(value = 15, message = "Długość publicznego slotu nie może być krótsza niż 15 minut.")
        @Max(value = 480, message = "Długość publicznego slotu nie może być dłuższa niż 480 minut.")
        Integer publicSlotDurationMinutes
) {
}
