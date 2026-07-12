package pl.atelierbypt.backend.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import pl.atelierbypt.backend.enums.AppointmentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter
@Setter
public class Appointment extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id",  nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JoinColumn(name = "offer_item_id",  nullable = false)
    private OfferItem offerItem;

    @NotNull
    @Column(nullable = false)
    private LocalDate appointmentDate;

    @NotNull
    @Column(nullable = false)
    private LocalTime startTime;

    @Positive
    @NotNull
    @Column(nullable = false)
    private Integer durationMinutes;

    @DecimalMin("0.00")
    @NotNull
    @Column(nullable = false)
    private BigDecimal price;

    @NotNull
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;

    @Size(max = 1000)
    private String note;
}
