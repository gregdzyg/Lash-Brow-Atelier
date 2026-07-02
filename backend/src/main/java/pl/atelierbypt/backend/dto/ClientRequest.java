package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ClientRequest(
        @NotBlank(message = "Imię jest wymagane.")
        String firstName,
        @NotBlank(message = "Nazwisko jest wymagane.")
        String lastName,
        @NotBlank(message = "Numer telefonu jest wymagany")
        String phoneNumber,
        @Email(message = "Niepoprawny adres email.")
        String email,
        String instagramUsername,
        String notes
) {

}


