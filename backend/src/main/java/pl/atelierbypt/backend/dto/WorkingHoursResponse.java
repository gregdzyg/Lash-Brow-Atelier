package pl.atelierbypt.backend.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record WorkingHoursResponse(
        Long id,
        DayOfWeek dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        boolean isWorkingDay,
        boolean isActive
) {
}
