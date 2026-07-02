package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ClientRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank String phoneNumber,
        String email,
        String instagramUsername,
        String notes
) {

}


