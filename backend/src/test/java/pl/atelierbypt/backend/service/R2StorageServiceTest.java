package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import pl.atelierbypt.backend.dto.OptimizedImage;
import pl.atelierbypt.backend.enums.ImageStorageFolder;
import pl.atelierbypt.backend.exception.BadRequestException;
import pl.atelierbypt.backend.exception.R2StorageException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class R2StorageServiceTest {

    private static final String BUCKET_NAME = "atelier-demo-gallery";

    @Mock
    private S3Client s3Client;
    @Mock
    private ImageOptimizationService imageOptimizationService;
    @Mock
    private MultipartFile oversizedFile;

    private R2StorageService r2StorageService;

    @BeforeEach
    void setUp() {
        r2StorageService = new R2StorageService(
                s3Client,
                imageOptimizationService,
                BUCKET_NAME
        );
    }

    @Test
    void shouldUploadOptimizedJpegAndReturnGeneratedObjectKey() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "photo.jpeg",
                "image/jpeg",
                new byte[]{1, 2, 3}
        );
        when(imageOptimizationService.optimize(file)).thenReturn(
                new OptimizedImage(
                        new byte[]{4, 5},
                        "image/jpeg",
                        "jpg"
                )
        );

        String objectKey = r2StorageService.upload(
                file,
                ImageStorageFolder.GALLERY
        );

        assertThat(objectKey)
                .startsWith("gallery/")
                .endsWith(".jpg");

        ArgumentCaptor<PutObjectRequest> requestCaptor =
                ArgumentCaptor.forClass(PutObjectRequest.class);
        ArgumentCaptor<RequestBody> bodyCaptor =
                ArgumentCaptor.forClass(RequestBody.class);
        verify(s3Client).putObject(
                requestCaptor.capture(),
                bodyCaptor.capture()
        );

        PutObjectRequest request = requestCaptor.getValue();
        assertThat(request.bucket()).isEqualTo(BUCKET_NAME);
        assertThat(request.key()).isEqualTo(objectKey);
        assertThat(request.contentType()).isEqualTo("image/jpeg");

        RequestBody requestBody = bodyCaptor.getValue();
        assertThat(requestBody.contentStreamProvider().newStream().readAllBytes())
                .containsExactly(4, 5);
        assertThat(requestBody.contentStreamProvider().newStream().readAllBytes())
                .containsExactly(4, 5);
    }

    @Test
    void shouldUploadNewsImageWithNewsObjectKeyPrefix() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "news.jpeg",
                "image/jpeg",
                new byte[]{1, 2, 3}
        );
        when(imageOptimizationService.optimize(file)).thenReturn(
                new OptimizedImage(
                        new byte[]{4, 5},
                        "image/jpeg",
                        "jpg"
                )
        );

        String objectKey = r2StorageService.upload(
                file,
                ImageStorageFolder.NEWS
        );

        assertThat(objectKey)
                .startsWith("news/")
                .endsWith(".jpg");
    }

    @Test
    void shouldRejectEmptyFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty.jpeg",
                "image/jpeg",
                new byte[0]
        );

        assertThatThrownBy(() -> r2StorageService.upload(
                file,
                ImageStorageFolder.GALLERY
        ))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Plik zdjęcia nie może być pusty.");

        verify(s3Client, never()).putObject(
                any(PutObjectRequest.class),
                any(RequestBody.class)
        );
        verify(imageOptimizationService, never()).optimize(any());
    }

    @Test
    void shouldRejectUnsupportedContentType() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "document.pdf",
                "application/pdf",
                new byte[]{1, 2, 3}
        );

        assertThatThrownBy(() -> r2StorageService.upload(
                file,
                ImageStorageFolder.GALLERY
        ))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Dozwolone formaty zdjęć to JPEG i PNG.");

        verify(s3Client, never()).putObject(
                any(PutObjectRequest.class),
                any(RequestBody.class)
        );
        verify(imageOptimizationService, never()).optimize(any());
    }

    @Test
    void shouldRejectFileLargerThanTenMegabytes() {
        when(oversizedFile.isEmpty()).thenReturn(false);
        when(oversizedFile.getSize()).thenReturn(10 * 1024 * 1024 + 1L);

        assertThatThrownBy(() -> r2StorageService.upload(
                oversizedFile,
                ImageStorageFolder.GALLERY
        ))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Plik zdjęcia nie może być większy niż 10 MB.");

        verify(s3Client, never()).putObject(
                any(PutObjectRequest.class),
                any(RequestBody.class)
        );
        verify(imageOptimizationService, never()).optimize(any());
    }

    @Test
    void shouldDeleteObjectFromConfiguredBucket() {
        String objectKey = "gallery/image.jpg";

        r2StorageService.delete(objectKey);

        ArgumentCaptor<DeleteObjectRequest> requestCaptor =
                ArgumentCaptor.forClass(DeleteObjectRequest.class);
        verify(s3Client).deleteObject(requestCaptor.capture());

        DeleteObjectRequest request = requestCaptor.getValue();
        assertThat(request.bucket()).isEqualTo(BUCKET_NAME);
        assertThat(request.key()).isEqualTo(objectKey);
    }

    @Test
    void shouldWrapStorageFailure() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "photo.png",
                "image/png",
                new byte[]{1, 2, 3}
        );
        when(imageOptimizationService.optimize(file)).thenReturn(
                new OptimizedImage(
                        new byte[]{4, 5},
                        "image/jpeg",
                        "jpg"
                )
        );
        when(s3Client.putObject(
                any(PutObjectRequest.class),
                any(RequestBody.class)
        )).thenThrow(S3Exception.builder().message("R2 unavailable").build());

        assertThatThrownBy(() -> r2StorageService.upload(
                file,
                ImageStorageFolder.GALLERY
        ))
                .isInstanceOf(R2StorageException.class)
                .hasMessage("Nie udało się wysłać zdjęcia.")
                .hasCauseInstanceOf(S3Exception.class);
    }
}
