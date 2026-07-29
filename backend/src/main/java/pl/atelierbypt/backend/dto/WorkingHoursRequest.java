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

        @NotNull(message = "Interwał publicznych terminów jest wymagany.")
        @Min(value = 15, message = "Interwał publicznych terminów nie może być krótszy niż 15 minut.")
        @Max(value = 480, message = "Interwał publicznych terminów nie może być dłuższy niż 480 minut.")
        Integer publicStartIntervalMinutes
) {
}
