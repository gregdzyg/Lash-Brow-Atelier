package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.multipart.MultipartFile;
import pl.atelierbypt.backend.dto.GalleryImageResponse;
import pl.atelierbypt.backend.entity.GalleryImage;
import pl.atelierbypt.backend.enums.GalleryImageMoveDirection;
import pl.atelierbypt.backend.enums.ImageStorageFolder;
import pl.atelierbypt.backend.exception.BusinessConflictException;
import pl.atelierbypt.backend.repository.GalleryImageRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GalleryImageManagementServiceTest {

    private static final String PUBLIC_BASE_URL = "https://gallery.example.com/";
    private static final String OBJECT_KEY = "gallery/image.jpg";

    @Mock
    private GalleryImageRepository galleryImageRepository;
    @Mock
    private R2StorageService r2StorageService;
    @Mock
    private MultipartFile file;

    private GalleryImageManagementService galleryImageManagementService;

    @BeforeEach
    void setUp() {
        galleryImageManagementService = new GalleryImageManagementService(
                galleryImageRepository,
                r2StorageService,
                PUBLIC_BASE_URL
        );
    }

    @Test
    void shouldUploadFileAndSaveGalleryImageMetadata() {
        when(r2StorageService.upload(file, ImageStorageFolder.GALLERY))
                .thenReturn(OBJECT_KEY);
        when(galleryImageRepository.saveAndFlush(any(GalleryImage.class)))
                .thenAnswer(invocation -> {
                    GalleryImage galleryImage = invocation.getArgument(0);
                    galleryImage.setId(10L);
                    galleryImage.setActive(true);
                    return galleryImage;
                });

        GalleryImageResponse response =
                galleryImageManagementService.createGalleryImage(
                        file,
                        "  Laminacja brwi  ",
                        "  Efekt laminacji brwi  "
                );

        ArgumentCaptor<GalleryImage> imageCaptor =
                ArgumentCaptor.forClass(GalleryImage.class);
        verify(galleryImageRepository).saveAndFlush(imageCaptor.capture());

        GalleryImage savedImage = imageCaptor.getValue();
        assertThat(savedImage.getObjectKey()).isEqualTo(OBJECT_KEY);
        assertThat(savedImage.getTitle()).isEqualTo("Laminacja brwi");
        assertThat(savedImage.getAltText()).isEqualTo("Efekt laminacji brwi");
        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.imageUrl())
                .isEqualTo("https://gallery.example.com/gallery/image.jpg");
        assertThat(response.sortOrder()).isZero();
        assertThat(response.isActive()).isTrue();
    }

    @Test
    void shouldReturnAllGalleryImagesIncludingInactiveOnes() {
        GalleryImage activeImage = galleryImage(
                1L,
                "gallery/active.jpg",
                "Aktywne zdjęcie",
                true
        );
        GalleryImage inactiveImage = galleryImage(
                2L,
                "gallery/inactive.jpg",
                "Ukryte zdjęcie",
                false
        );
        when(galleryImageRepository.findAllByOrderBySortOrderAscCreatedAtDesc())
                .thenReturn(List.of(activeImage, inactiveImage));

        List<GalleryImageResponse> response =
                galleryImageManagementService.getGalleryImages();

        assertThat(response).hasSize(2);
        assertThat(response.get(0).imageUrl())
                .isEqualTo("https://gallery.example.com/gallery/active.jpg");
        assertThat(response.get(0).isActive()).isTrue();
        assertThat(response.get(1).imageUrl())
                .isEqualTo("https://gallery.example.com/gallery/inactive.jpg");
        assertThat(response.get(1).isActive()).isFalse();
    }

    @Test
    void shouldChangeGalleryImageVisibility() {
        GalleryImage galleryImage = galleryImage(
                1L,
                "gallery/image.jpg",
                "Zdjęcie",
                true
        );
        when(galleryImageRepository.findById(1L))
                .thenReturn(Optional.of(galleryImage));
        when(galleryImageRepository.save(galleryImage))
                .thenReturn(galleryImage);

        GalleryImageResponse response = galleryImageManagementService
                .setGalleryImageVisibility(1L, false);

        assertThat(galleryImage.isActive()).isFalse();
        assertThat(response.isActive()).isFalse();
        verify(galleryImageRepository).save(galleryImage);
    }

    @Test
    void shouldUpdateGalleryImageDetails() {
        GalleryImage galleryImage = galleryImage(
                1L,
                "gallery/image.jpg",
                "Poprzedni tytuł",
                true
        );
        when(galleryImageRepository.findById(1L))
                .thenReturn(Optional.of(galleryImage));
        when(galleryImageRepository.save(galleryImage))
                .thenReturn(galleryImage);

        GalleryImageResponse response = galleryImageManagementService
                .updateGalleryImageDetails(
                        1L,
                        "  Nowy tytuł  ",
                        "  Nowy opis alternatywny  "
                );

        assertThat(galleryImage.getTitle()).isEqualTo("Nowy tytuł");
        assertThat(galleryImage.getAltText())
                .isEqualTo("Nowy opis alternatywny");
        assertThat(response.title()).isEqualTo("Nowy tytuł");
        assertThat(response.altText()).isEqualTo("Nowy opis alternatywny");
        verify(galleryImageRepository).save(galleryImage);
    }

    @Test
    void shouldMoveGalleryImageUpAndNormalizeSortOrder() {
        GalleryImage firstImage = galleryImage(
                1L,
                "gallery/first.jpg",
                "Pierwsze zdjęcie",
                true
        );
        GalleryImage secondImage = galleryImage(
                2L,
                "gallery/second.jpg",
                "Drugie zdjęcie",
                true
        );
        GalleryImage thirdImage = galleryImage(
                3L,
                "gallery/third.jpg",
                "Trzecie zdjęcie",
                true
        );
        when(galleryImageRepository.findAllByOrderBySortOrderAscCreatedAtDesc())
                .thenReturn(List.of(firstImage, secondImage, thirdImage));

        List<GalleryImageResponse> response = galleryImageManagementService
                .moveGalleryImage(2L, GalleryImageMoveDirection.UP);

        assertThat(response).extracting(GalleryImageResponse::id)
                .containsExactly(2L, 1L, 3L);
        assertThat(secondImage.getSortOrder()).isZero();
        assertThat(firstImage.getSortOrder()).isEqualTo(1);
        assertThat(thirdImage.getSortOrder()).isEqualTo(2);
        verify(galleryImageRepository).saveAll(
                List.of(secondImage, firstImage, thirdImage)
        );
    }

    @Test
    void shouldDeleteInactiveGalleryImageFromR2AndDatabase() {
        GalleryImage galleryImage = galleryImage(
                1L,
                "gallery/image.jpg",
                "Zdjęcie",
                false
        );
        when(galleryImageRepository.findById(1L))
                .thenReturn(Optional.of(galleryImage));

        galleryImageManagementService.deleteGalleryImage(1L);

        verify(r2StorageService).delete("gallery/image.jpg");
        verify(galleryImageRepository).delete(galleryImage);
    }

    @Test
    void shouldRejectPermanentDeletionOfActiveGalleryImage() {
        GalleryImage galleryImage = galleryImage(
                1L,
                "gallery/image.jpg",
                "Zdjęcie",
                true
        );
        when(galleryImageRepository.findById(1L))
                .thenReturn(Optional.of(galleryImage));

        assertThatThrownBy(() ->
                galleryImageManagementService.deleteGalleryImage(1L)
        )
                .isInstanceOf(BusinessConflictException.class)
                .hasMessage("Przed trwałym usunięciem ukryj zdjęcie.");

        verify(r2StorageService, never()).delete("gallery/image.jpg");
        verify(galleryImageRepository, never()).delete(galleryImage);
    }

    @Test
    void shouldDeleteUploadedObjectWhenSavingMetadataFails() {
        when(r2StorageService.upload(file, ImageStorageFolder.GALLERY))
                .thenReturn(OBJECT_KEY);
        when(galleryImageRepository.saveAndFlush(any(GalleryImage.class)))
                .thenThrow(new DataIntegrityViolationException("Database unavailable"));

        assertThatThrownBy(() ->
                galleryImageManagementService.createGalleryImage(
                        file,
                        null,
                        null
                ))
                .isInstanceOf(DataIntegrityViolationException.class);

        verify(r2StorageService).delete(OBJECT_KEY);
    }

    private GalleryImage galleryImage(
            Long id,
            String objectKey,
            String title,
            boolean isActive
    ) {
        GalleryImage galleryImage = new GalleryImage();
        galleryImage.setId(id);
        galleryImage.setObjectKey(objectKey);
        galleryImage.setTitle(title);
        galleryImage.setActive(isActive);
        return galleryImage;
    }
}
