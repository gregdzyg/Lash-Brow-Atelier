package pl.atelierbypt.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Getter
@Setter
public class WorkingHours extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(nullable = false)
    private DayOfWeek dayOfWeek;

    private LocalTime startTime;
    private LocalTime endTime;

    @Column(nullable = false)
    private boolean isWorkingDay;

    @NotNull
    @Min(15)
    @Max(480)
    @Column(nullable = false)
    private Integer publicStartIntervalMinutes;
}
