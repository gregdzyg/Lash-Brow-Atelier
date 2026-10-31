package pl.atelierbypt.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class GalleryImage extends BaseEntity {

    @NotBlank
    @Column(nullable = false, unique = true, length = 512)
    private String objectKey;

    private String title;

    @Column(length = 500)
    private String altText;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false)
    private Integer sortOrder = 0;
}
