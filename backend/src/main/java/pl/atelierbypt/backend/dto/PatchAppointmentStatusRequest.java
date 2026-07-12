package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.NotNull;
import pl.atelierbypt.backend.enums.AppointmentStatus;

public record PatchAppointmentStatusRequest(
        @NotNull
        AppointmentStatus appointmentStatus) {
}
