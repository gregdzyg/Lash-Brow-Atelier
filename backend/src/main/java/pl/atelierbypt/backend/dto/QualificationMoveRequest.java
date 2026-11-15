package pl.atelierbypt.backend.dto;

import jakarta.validation.constraints.NotNull;
import pl.atelierbypt.backend.enums.QualificationMoveDirection;

public record QualificationMoveRequest(
        @NotNull(message = "Kierunek przesunięcia jest wymagany.")
        QualificationMoveDirection direction
) {
}
