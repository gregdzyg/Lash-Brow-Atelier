package pl.atelierbypt.backend.dto;

public record ClientResponse(
        Long id,
        String firstName,
        String lastName,
        String phoneNumber,
        String email,
        String instagramUsername,
        String notes,
        boolean active
) {
}
