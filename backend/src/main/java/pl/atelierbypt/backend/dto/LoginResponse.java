package pl.atelierbypt.backend.dto;

import pl.atelierbypt.backend.enums.UserRole;

public record LoginResponse(String token, String username, UserRole role) {
}
