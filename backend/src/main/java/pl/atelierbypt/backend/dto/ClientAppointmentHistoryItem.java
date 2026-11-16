package pl.atelierbypt.backend.dto;

import pl.atelierbypt.backend.enums.AppointmentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record ClientAppointmentHistoryItem(
        Long id,
        String offerItemName,
        LocalDate appointmentDate,
        LocalTime startTime,
        Integer durationMinutes,
        BigDecimal price,
        AppointmentStatus status,
        boolean active,
        boolean hasEnded
) {
}
