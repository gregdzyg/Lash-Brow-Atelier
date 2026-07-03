package pl.atelierbypt.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import pl.atelierbypt.backend.enums.OfferItemCategory;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
public class OfferItem extends BaseEntity {

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(nullable = false)
    private OfferItemCategory category;

    @Column(length = 1000)
    private String description;

    @NotNull
    @Column(nullable = false)
    @Positive
    private Integer durationMinutes;

    @NotNull
    @DecimalMin("0.00")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

}
