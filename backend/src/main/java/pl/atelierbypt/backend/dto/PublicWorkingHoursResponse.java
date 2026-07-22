package pl.atelierbypt.backend.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record PublicWorkingHoursResponse(
        DayOfWeek dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        boolean isWorkingDay
) {
}
