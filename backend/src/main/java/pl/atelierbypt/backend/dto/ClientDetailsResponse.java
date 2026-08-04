package pl.atelierbypt.backend.dto;

import java.util.List;

public record ClientDetailsResponse(
        Long id,
        String firstName,
        String lastName,
        String phoneNumber,
        String email,
        String instagramUsername,
        String notes,
        boolean active,
        List<ClientAppointmentSummaryResponse> upcomingAppointments
) {
}
