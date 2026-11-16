package pl.atelierbypt.backend.dto;

import java.util.List;

public record ClientAppointmentHistoryResponse(
        List<ClientAppointmentHistoryItem> appointments,
        int page,
        boolean hasMore
) {
}
