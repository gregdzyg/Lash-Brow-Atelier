package pl.atelierbypt.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record PublicAvailabilityDayResponse(
        LocalDate date,
        List<LocalTime> availableStartTimes
) {
}
