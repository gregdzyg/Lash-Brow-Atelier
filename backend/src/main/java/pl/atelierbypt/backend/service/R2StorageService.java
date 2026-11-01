package pl.atelierbypt.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pl.atelierbypt.backend.dto.OptimizedImage;
import pl.atelierbypt.backend.exception.BadRequestException;
import pl.atelierbypt.backend.exception.R2StorageException;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.util.Set;
import java.util.UUID;

@Service
@ConditionalOnProperty(prefix = "app.r2", name = "enabled", havingValue = "true")
public class R2StorageService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final String OBJECT_KEY_PREFIX = "gallery/";
    private static final Set<String> SUPPORTED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png"
    );

    private final S3Client s3Client;
    private final ImageOptimizationService imageOptimizationService;
    private final String bucketName;

    public R2StorageService(
            S3Client s3Client,
            ImageOptimizationService imageOptimizationService,
            @Value("${app.r2.bucket}") String bucketName
    ) {
        this.s3Client = s3Client;
        this.imageOptimizationService = imageOptimizationService;
        this.bucketName = bucketName;
    }

    public String upload(MultipartFile file) {
        validateFile(file);
        OptimizedImage optimizedImage = imageOptimizationService.optimize(file);
        String objectKey = OBJECT_KEY_PREFIX
                + UUID.randomUUID()
                + "."
                + optimizedImage.fileExtension();

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .contentType(optimizedImage.contentType())
                .build();

        try {
            s3Client.putObject(
                    request,
                    RequestBody.fromBytes(optimizedImage.content())
            );
            return objectKey;
        } catch (SdkException exception) {
            throw new R2StorageException("Nie udało się wysłać zdjęcia.", exception);
        }
    }

    public void delete(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) {
            throw new IllegalArgumentException("Object key cannot be blank.");
        }

        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .build();

        try {
            s3Client.deleteObject(request);
        } catch (SdkException exception) {
            throw new R2StorageException("Nie udało się usunąć zdjęcia.", exception);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Plik zdjęcia nie może być pusty.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Plik zdjęcia nie może być większy niż 10 MB.");
        }

        if (!SUPPORTED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Dozwolone formaty zdjęć to JPEG i PNG.");
        }
    }
}
