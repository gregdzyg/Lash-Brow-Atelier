package pl.atelierbypt.backend.dto;

import java.time.LocalDate;
import java.util.List;

public record AdminAvailabilityDayResponse(
        LocalDate date,
        List<AvailableTimeRangeResponse> availableRanges
) {
}
