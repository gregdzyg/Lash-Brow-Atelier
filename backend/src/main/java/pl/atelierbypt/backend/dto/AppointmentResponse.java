package pl.atelierbypt.backend.dto;

import pl.atelierbypt.backend.enums.AppointmentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentResponse(Long id, Long clientId, String clientFirstName, String clientLastName,
                                  Long offerItemId, String offerItemName, LocalDate appointmentDate,
                                  LocalTime startTime, Integer durationMinutes, BigDecimal price,
                                  AppointmentStatus status, String note, boolean hasEnded,
                                  boolean isActive) {
}
