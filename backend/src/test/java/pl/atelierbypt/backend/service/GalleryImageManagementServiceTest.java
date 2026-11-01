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
import pl.atelierbypt.backend.repository.GalleryImageRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
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
        when(r2StorageService.upload(file)).thenReturn(OBJECT_KEY);
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
    void shouldDeleteUploadedObjectWhenSavingMetadataFails() {
        when(r2StorageService.upload(file)).thenReturn(OBJECT_KEY);
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
}
