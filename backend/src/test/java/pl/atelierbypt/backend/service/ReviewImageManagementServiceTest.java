package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.multipart.MultipartFile;
import pl.atelierbypt.backend.dto.ReviewImageResponse;
import pl.atelierbypt.backend.entity.ReviewImage;
import pl.atelierbypt.backend.enums.ImageStorageFolder;
import pl.atelierbypt.backend.enums.ReviewImageMoveDirection;
import pl.atelierbypt.backend.exception.BusinessConflictException;
import pl.atelierbypt.backend.repository.ReviewImageRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewImageManagementServiceTest {

    private static final String PUBLIC_BASE_URL = "https://reviews.example.com/";
    private static final String OBJECT_KEY = "reviews/review.png";

    @Mock
    private ReviewImageRepository reviewImageRepository;

    @Mock
    private R2StorageService r2StorageService;

    @Mock
    private MultipartFile file;

    private ReviewImageManagementService reviewImageManagementService;

    @BeforeEach
    void setUp() {
        reviewImageManagementService = new ReviewImageManagementService(
                reviewImageRepository,
                r2StorageService,
                PUBLIC_BASE_URL
        );
    }

    @Test
    void shouldReturnAllReviewImagesIncludingHiddenOnes() {
        ReviewImage visible = reviewImage(1L, "reviews/visible.png", 0, true);
        ReviewImage hidden = reviewImage(2L, "reviews/hidden.png", 1, false);
        when(reviewImageRepository
                .findAllByOrderBySortOrderAscCreatedAtDesc())
                .thenReturn(List.of(visible, hidden));

        List<ReviewImageResponse> response = reviewImageManagementService
                .getReviewImages();

        assertThat(response).hasSize(2);
        assertThat(response.getFirst().imageUrl())
                .isEqualTo("https://reviews.example.com/reviews/visible.png");
        assertThat(response.getLast().active()).isFalse();
    }

    @Test
    void shouldUploadReviewAtTopAndShiftExistingImages() {
        ReviewImage existing = reviewImage(
                1L,
                "reviews/existing.png",
                0,
                true
        );
        when(r2StorageService.upload(file, ImageStorageFolder.REVIEWS))
                .thenReturn(OBJECT_KEY);
        when(reviewImageRepository
                .findAllByOrderBySortOrderAscCreatedAtDesc())
                .thenReturn(List.of(existing));
        when(reviewImageRepository.saveAndFlush(any(ReviewImage.class)))
                .thenAnswer(invocation -> {
                    ReviewImage saved = invocation.getArgument(0);
                    saved.setId(2L);
                    saved.setActive(true);
                    return saved;
                });

        ReviewImageResponse response = reviewImageManagementService
                .createReviewImage(file, "  Opinia klientki  ");

        ArgumentCaptor<ReviewImage> imageCaptor =
                ArgumentCaptor.forClass(ReviewImage.class);
        verify(reviewImageRepository).saveAndFlush(imageCaptor.capture());
        assertThat(imageCaptor.getValue().getObjectKey()).isEqualTo(OBJECT_KEY);
        assertThat(imageCaptor.getValue().getAltText())
                .isEqualTo("Opinia klientki");
        assertThat(response.sortOrder()).isZero();
        assertThat(existing.getSortOrder()).isEqualTo(1);
        verify(reviewImageRepository).saveAll(List.of(existing));
    }

    @Test
    void shouldUpdateAlternativeTextAndVisibility() {
        ReviewImage reviewImage = reviewImage(1L, OBJECT_KEY, 0, true);
        when(reviewImageRepository.findById(1L))
                .thenReturn(Optional.of(reviewImage));
        when(reviewImageRepository.save(reviewImage))
                .thenReturn(reviewImage);

        ReviewImageResponse detailsResponse = reviewImageManagementService
                .updateReviewImageDetails(1L, "  Nowy opis  ");
        ReviewImageResponse visibilityResponse = reviewImageManagementService
                .setReviewImageVisibility(1L, false);

        assertThat(detailsResponse.altText()).isEqualTo("Nowy opis");
        assertThat(visibilityResponse.active()).isFalse();
    }

    @Test
    void shouldMoveReviewImageAndNormalizeOrder() {
        ReviewImage first = reviewImage(1L, "reviews/first.png", 4, true);
        ReviewImage second = reviewImage(2L, "reviews/second.png", 8, true);
        when(reviewImageRepository
                .findAllByOrderBySortOrderAscCreatedAtDesc())
                .thenReturn(List.of(first, second));

        List<ReviewImageResponse> response = reviewImageManagementService
                .moveReviewImage(2L, ReviewImageMoveDirection.UP);

        assertThat(response).extracting(ReviewImageResponse::id)
                .containsExactly(2L, 1L);
        assertThat(second.getSortOrder()).isZero();
        assertThat(first.getSortOrder()).isEqualTo(1);
        verify(reviewImageRepository).saveAll(List.of(second, first));
    }

    @Test
    void shouldDeleteHiddenReviewFromR2AndNormalizeRemainingImages() {
        ReviewImage removed = reviewImage(1L, OBJECT_KEY, 0, false);
        ReviewImage remaining = reviewImage(
                2L,
                "reviews/remaining.png",
                5,
                true
        );
        when(reviewImageRepository.findById(1L))
                .thenReturn(Optional.of(removed));
        when(reviewImageRepository
                .findAllByOrderBySortOrderAscCreatedAtDesc())
                .thenReturn(List.of(remaining));

        reviewImageManagementService.deleteReviewImage(1L);

        verify(r2StorageService).delete(OBJECT_KEY);
        verify(reviewImageRepository).delete(removed);
        assertThat(remaining.getSortOrder()).isZero();
        verify(reviewImageRepository).saveAll(List.of(remaining));
    }

    @Test
    void shouldRejectDeletionOfVisibleReview() {
        ReviewImage reviewImage = reviewImage(1L, OBJECT_KEY, 0, true);
        when(reviewImageRepository.findById(1L))
                .thenReturn(Optional.of(reviewImage));

        assertThatThrownBy(() ->
                reviewImageManagementService.deleteReviewImage(1L)
        )
                .isInstanceOf(BusinessConflictException.class)
                .hasMessage("Przed trwałym usunięciem ukryj opinię.");
        verify(r2StorageService, never()).delete(OBJECT_KEY);
        verify(reviewImageRepository, never()).delete(reviewImage);
    }

    @Test
    void shouldDeleteUploadedObjectWhenSavingMetadataFails() {
        when(r2StorageService.upload(file, ImageStorageFolder.REVIEWS))
                .thenReturn(OBJECT_KEY);
        when(reviewImageRepository
                .findAllByOrderBySortOrderAscCreatedAtDesc())
                .thenReturn(List.of());
        when(reviewImageRepository.saveAndFlush(any(ReviewImage.class)))
                .thenThrow(new DataIntegrityViolationException(
                        "Database unavailable"
                ));

        assertThatThrownBy(() ->
                reviewImageManagementService.createReviewImage(file, null)
        ).isInstanceOf(DataIntegrityViolationException.class);
        verify(r2StorageService).delete(OBJECT_KEY);
    }

    private ReviewImage reviewImage(
            Long id,
            String objectKey,
            int sortOrder,
            boolean active
    ) {
        ReviewImage reviewImage = new ReviewImage();
        reviewImage.setId(id);
        reviewImage.setObjectKey(objectKey);
        reviewImage.setSortOrder(sortOrder);
        reviewImage.setActive(active);
        return reviewImage;
    }
}
