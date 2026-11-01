package pl.atelierbypt.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pl.atelierbypt.backend.dto.GalleryImageResponse;
import pl.atelierbypt.backend.entity.GalleryImage;
import pl.atelierbypt.backend.exception.ResourceNotFoundException;
import pl.atelierbypt.backend.repository.GalleryImageRepository;

import java.util.List;

@Service
@ConditionalOnProperty(prefix = "app.r2", name = "enabled", havingValue = "true")
public class GalleryImageManagementService {

    private final GalleryImageRepository galleryImageRepository;
    private final R2StorageService r2StorageService;
    private final String publicBaseUrl;

    public GalleryImageManagementService(
            GalleryImageRepository galleryImageRepository,
            R2StorageService r2StorageService,
            @Value("${app.r2.public-base-url}") String publicBaseUrl
    ) {
        this.galleryImageRepository = galleryImageRepository;
        this.r2StorageService = r2StorageService;
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    @Transactional(readOnly = true)
    public List<GalleryImageResponse> getGalleryImages() {
        return galleryImageRepository
                .findAllByOrderBySortOrderAscCreatedAtDesc()
                .stream()
                .map(this::mapToGalleryImageResponse)
                .toList();
    }

    @Transactional
    public GalleryImageResponse setGalleryImageVisibility(
            Long imageId,
            boolean isActive
    ) {
        GalleryImage galleryImage = findGalleryImage(imageId);

        galleryImage.setActive(isActive);
        GalleryImage savedImage = galleryImageRepository.save(galleryImage);
        return mapToGalleryImageResponse(savedImage);
    }

    @Transactional
    public GalleryImageResponse updateGalleryImageDetails(
            Long imageId,
            String title,
            String altText
    ) {
        GalleryImage galleryImage = findGalleryImage(imageId);
        galleryImage.setTitle(normalizeOptionalText(title));
        galleryImage.setAltText(normalizeOptionalText(altText));

        GalleryImage savedImage = galleryImageRepository.save(galleryImage);
        return mapToGalleryImageResponse(savedImage);
    }

    @Transactional
    public GalleryImageResponse createGalleryImage(
            MultipartFile file,
            String title,
            String altText
    ) {
        String objectKey = r2StorageService.upload(file);

        try {
            GalleryImage galleryImage = new GalleryImage();
            galleryImage.setObjectKey(objectKey);
            galleryImage.setTitle(normalizeOptionalText(title));
            galleryImage.setAltText(normalizeOptionalText(altText));

            GalleryImage savedGalleryImage =
                    galleryImageRepository.saveAndFlush(galleryImage);
            return mapToGalleryImageResponse(savedGalleryImage);
        } catch (RuntimeException exception) {
            deleteUploadedObject(objectKey, exception);
            throw exception;
        }
    }

    private void deleteUploadedObject(String objectKey, RuntimeException originalException) {
        try {
            r2StorageService.delete(objectKey);
        } catch (RuntimeException cleanupException) {
            originalException.addSuppressed(cleanupException);
        }
    }

    private GalleryImage findGalleryImage(Long imageId) {
        return galleryImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Nie znaleziono zdjęcia galerii o id: " + imageId
                ));
    }

    private GalleryImageResponse mapToGalleryImageResponse(GalleryImage galleryImage) {
        return new GalleryImageResponse(
                galleryImage.getId(),
                publicBaseUrl + "/" + galleryImage.getObjectKey(),
                galleryImage.getTitle(),
                galleryImage.getAltText(),
                galleryImage.getSortOrder(),
                galleryImage.isActive()
        );
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
