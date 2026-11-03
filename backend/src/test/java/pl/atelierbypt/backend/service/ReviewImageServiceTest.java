package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.atelierbypt.backend.dto.PublicReviewImageResponse;
import pl.atelierbypt.backend.entity.ReviewImage;
import pl.atelierbypt.backend.repository.ReviewImageRepository;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewImageServiceTest {

    @Mock
    private ReviewImageRepository reviewImageRepository;

    private ReviewImageService reviewImageService;

    @BeforeEach
    void setUp() {
        reviewImageService = new ReviewImageService(
                reviewImageRepository,
                "https://example.r2.dev/"
        );
    }

    @Test
    void shouldReturnVisibleReviewImagesInRepositoryOrder() {
        ReviewImage first = reviewImage(
                1L,
                "reviews/first.png",
                "Opinia klientki o stylizacji rzęs"
        );
        ReviewImage second = reviewImage(
                2L,
                "reviews/second.png",
                null
        );
        when(reviewImageRepository
                .findByIsActiveTrueOrderBySortOrderAscCreatedAtDesc())
                .thenReturn(List.of(first, second));

        List<PublicReviewImageResponse> response = reviewImageService
                .getPublicReviewImages();

        assertThat(response).hasSize(2);
        assertThat(response.getFirst().imageUrl())
                .isEqualTo("https://example.r2.dev/reviews/first.png");
        assertThat(response.getFirst().altText())
                .isEqualTo("Opinia klientki o stylizacji rzęs");
        assertThat(response.getLast().imageUrl())
                .isEqualTo("https://example.r2.dev/reviews/second.png");
    }

    private ReviewImage reviewImage(
            Long id,
            String objectKey,
            String altText
    ) {
        ReviewImage reviewImage = new ReviewImage();
        reviewImage.setId(id);
        reviewImage.setObjectKey(objectKey);
        reviewImage.setAltText(altText);
        return reviewImage;
    }
}
