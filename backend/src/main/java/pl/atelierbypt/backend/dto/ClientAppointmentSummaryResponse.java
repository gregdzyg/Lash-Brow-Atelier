package pl.atelierbypt.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record ClientAppointmentSummaryResponse(
        Long id,
        String offerItemName,
        LocalDate appointmentDate,
        LocalTime startTime,
        Integer durationMinutes
) {
}
