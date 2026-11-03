package pl.atelierbypt.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pl.atelierbypt.backend.dto.ReviewImageResponse;
import pl.atelierbypt.backend.entity.ReviewImage;
import pl.atelierbypt.backend.enums.ImageStorageFolder;
import pl.atelierbypt.backend.enums.ReviewImageMoveDirection;
import pl.atelierbypt.backend.exception.BusinessConflictException;
import pl.atelierbypt.backend.exception.ResourceNotFoundException;
import pl.atelierbypt.backend.repository.ReviewImageRepository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@ConditionalOnProperty(prefix = "app.r2", name = "enabled", havingValue = "true")
public class ReviewImageManagementService {

    private final ReviewImageRepository reviewImageRepository;
    private final R2StorageService r2StorageService;
    private final String publicBaseUrl;

    public ReviewImageManagementService(
            ReviewImageRepository reviewImageRepository,
            R2StorageService r2StorageService,
            @Value("${app.r2.public-base-url}") String publicBaseUrl
    ) {
        this.reviewImageRepository = reviewImageRepository;
        this.r2StorageService = r2StorageService;
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    @Transactional(readOnly = true)
    public List<ReviewImageResponse> getReviewImages() {
        return reviewImageRepository
                .findAllByOrderBySortOrderAscCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ReviewImageResponse createReviewImage(
            MultipartFile file,
            String altText
    ) {
        String objectKey = r2StorageService.upload(
                file,
                ImageStorageFolder.REVIEWS
        );

        try {
            List<ReviewImage> existingImages = reviewImageRepository
                    .findAllByOrderBySortOrderAscCreatedAtDesc();
            existingImages.forEach(image -> image.setSortOrder(
                    image.getSortOrder() + 1
            ));
            reviewImageRepository.saveAll(existingImages);

            ReviewImage reviewImage = new ReviewImage();
            reviewImage.setObjectKey(objectKey);
            reviewImage.setAltText(normalizeOptionalText(altText));
            reviewImage.setSortOrder(0);

            return mapToResponse(
                    reviewImageRepository.saveAndFlush(reviewImage)
            );
        } catch (RuntimeException exception) {
            deleteUploadedObject(objectKey, exception);
            throw exception;
        }
    }

    @Transactional
    public ReviewImageResponse updateReviewImageDetails(
            Long imageId,
            String altText
    ) {
        ReviewImage reviewImage = findReviewImage(imageId);
        reviewImage.setAltText(normalizeOptionalText(altText));
        return mapToResponse(reviewImageRepository.save(reviewImage));
    }

    @Transactional
    public ReviewImageResponse setReviewImageVisibility(
            Long imageId,
            boolean active
    ) {
        ReviewImage reviewImage = findReviewImage(imageId);
        reviewImage.setActive(active);
        return mapToResponse(reviewImageRepository.save(reviewImage));
    }

    @Transactional
    public List<ReviewImageResponse> moveReviewImage(
            Long imageId,
            ReviewImageMoveDirection direction
    ) {
        List<ReviewImage> reviewImages = new ArrayList<>(
                reviewImageRepository
                        .findAllByOrderBySortOrderAscCreatedAtDesc()
        );
        int currentIndex = findReviewImageIndex(reviewImages, imageId);
        int targetIndex = direction == ReviewImageMoveDirection.UP
                ? currentIndex - 1
                : currentIndex + 1;

        if (targetIndex >= 0 && targetIndex < reviewImages.size()) {
            Collections.swap(reviewImages, currentIndex, targetIndex);
            normalizeSortOrder(reviewImages);
            reviewImageRepository.saveAll(reviewImages);
        }

        return reviewImages.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void deleteReviewImage(Long imageId) {
        ReviewImage reviewImage = findReviewImage(imageId);

        if (reviewImage.isActive()) {
            throw new BusinessConflictException(
                    "Przed trwałym usunięciem ukryj opinię."
            );
        }

        r2StorageService.delete(reviewImage.getObjectKey());
        reviewImageRepository.delete(reviewImage);
        List<ReviewImage> remainingImages = reviewImageRepository
                .findAllByOrderBySortOrderAscCreatedAtDesc();
        normalizeSortOrder(remainingImages);
        reviewImageRepository.saveAll(remainingImages);
    }

    private ReviewImage findReviewImage(Long imageId) {
        return reviewImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Nie znaleziono opinii o id: " + imageId
                ));
    }

    private int findReviewImageIndex(
            List<ReviewImage> reviewImages,
            Long imageId
    ) {
        for (int index = 0; index < reviewImages.size(); index++) {
            if (reviewImages.get(index).getId().equals(imageId)) {
                return index;
            }
        }

        throw new ResourceNotFoundException(
                "Nie znaleziono opinii o id: " + imageId
        );
    }

    private void normalizeSortOrder(List<ReviewImage> reviewImages) {
        for (int index = 0; index < reviewImages.size(); index++) {
            reviewImages.get(index).setSortOrder(index);
        }
    }

    private ReviewImageResponse mapToResponse(ReviewImage reviewImage) {
        return new ReviewImageResponse(
                reviewImage.getId(),
                publicBaseUrl + "/" + reviewImage.getObjectKey(),
                reviewImage.getAltText(),
                reviewImage.getSortOrder(),
                reviewImage.isActive()
        );
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private void deleteUploadedObject(
            String objectKey,
            RuntimeException originalException
    ) {
        try {
            r2StorageService.delete(objectKey);
        } catch (RuntimeException cleanupException) {
            originalException.addSuppressed(cleanupException);
        }
    }
}
