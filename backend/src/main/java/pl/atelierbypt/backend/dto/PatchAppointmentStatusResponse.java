package pl.atelierbypt.backend.dto;

import pl.atelierbypt.backend.enums.AppointmentStatus;

public record PatchAppointmentStatusResponse(Long id, AppointmentStatus appointmentStatus) {
}
