package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.atelierbypt.backend.dto.PublicGalleryImagesResponse;
import pl.atelierbypt.backend.entity.GalleryImage;
import pl.atelierbypt.backend.repository.GalleryImageRepository;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GalleryImageServiceTest {

    @Mock
    private GalleryImageRepository galleryImageRepository;

    private GalleryImageService galleryImageService;

    @BeforeEach
    void setUp() {
        galleryImageService = new GalleryImageService(
                galleryImageRepository,
                "https://example.r2.dev/"
        );
    }

    @Test
    void shouldReturnVisibleGalleryImagesInRepositoryOrder() {
        GalleryImage image = new GalleryImage();
        image.setId(1L);
        image.setObjectKey("gallery/stylizacja.jpg");
        image.setTitle("Naturalna stylizacja");
        image.setAltText("Efekt stylizacji rzęs");
        when(galleryImageRepository
                .findByIsActiveTrueOrderBySortOrderAscCreatedAtDesc())
                .thenReturn(List.of(image));
        when(galleryImageRepository.count()).thenReturn(1L);

        PublicGalleryImagesResponse response = galleryImageService
                .getPublicGalleryImages();

        assertThat(response.configured()).isTrue();
        assertThat(response.images()).hasSize(1);
        assertThat(response.images().getFirst().imageUrl())
                .isEqualTo("https://example.r2.dev/gallery/stylizacja.jpg");
        assertThat(response.images().getFirst().title())
                .isEqualTo("Naturalna stylizacja");
        assertThat(response.images().getFirst().altText())
                .isEqualTo("Efekt stylizacji rzęs");
    }

    @Test
    void shouldRemainConfiguredWhenAllGalleryImagesAreHidden() {
        when(galleryImageRepository
                .findByIsActiveTrueOrderBySortOrderAscCreatedAtDesc())
                .thenReturn(List.of());
        when(galleryImageRepository.count()).thenReturn(2L);

        PublicGalleryImagesResponse response = galleryImageService
                .getPublicGalleryImages();

        assertThat(response.configured()).isTrue();
        assertThat(response.images()).isEmpty();
    }

    @Test
    void shouldRemainUnconfiguredBeforeFirstGalleryImageIsAdded() {
        when(galleryImageRepository
                .findByIsActiveTrueOrderBySortOrderAscCreatedAtDesc())
                .thenReturn(List.of());
        when(galleryImageRepository.count()).thenReturn(0L);

        PublicGalleryImagesResponse response = galleryImageService
                .getPublicGalleryImages();

        assertThat(response.configured()).isFalse();
        assertThat(response.images()).isEmpty();
    }
}
