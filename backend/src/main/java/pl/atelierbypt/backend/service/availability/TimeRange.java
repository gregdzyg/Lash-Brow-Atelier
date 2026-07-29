package pl.atelierbypt.backend.service.availability;

import java.time.LocalTime;

public record TimeRange(LocalTime startTime, LocalTime endTime) {

    public TimeRange {
        if (startTime == null || endTime == null || !startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Nieprawidłowy przedział czasu.");
        }
    }

    public boolean contains(TimeRange other) {
        return !other.startTime().isBefore(startTime)
                && !other.endTime().isAfter(endTime);
    }

    public boolean overlaps(TimeRange other) {
        return startTime.isBefore(other.endTime())
                && endTime.isAfter(other.startTime());
    }
}
