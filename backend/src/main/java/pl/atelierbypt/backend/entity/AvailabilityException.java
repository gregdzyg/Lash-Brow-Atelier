package pl.atelierbypt.backend.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import pl.atelierbypt.backend.enums.AvailabilityExceptionType;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter
@Setter
public class AvailabilityException extends BaseEntity {

    @NotNull
    @Column(nullable = false)
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(nullable = false)
    private AvailabilityExceptionType type;

    @Size(max = 500)
    private String note;
}
