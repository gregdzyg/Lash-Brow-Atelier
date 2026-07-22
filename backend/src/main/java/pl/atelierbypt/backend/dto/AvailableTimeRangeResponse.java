package pl.atelierbypt.backend.dto;

import java.time.LocalTime;

public record AvailableTimeRangeResponse(LocalTime startTime, LocalTime endTime) {
}
