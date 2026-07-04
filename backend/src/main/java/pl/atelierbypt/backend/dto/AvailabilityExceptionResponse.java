package pl.atelierbypt.backend.dto;

import pl.atelierbypt.backend.enums.AvailabilityExceptionType;

import java.time.LocalDate;
import java.time.LocalTime;

public record AvailabilityExceptionResponse(
        Long id,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        AvailabilityExceptionType type,
        String note,
        boolean isActive
) {
}
