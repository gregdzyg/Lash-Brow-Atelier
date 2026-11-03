package pl.atelierbypt.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.atelierbypt.backend.dto.PublicReviewImageResponse;
import pl.atelierbypt.backend.entity.ReviewImage;
import pl.atelierbypt.backend.repository.ReviewImageRepository;

import java.util.List;

@Service
public class ReviewImageService {

    private final ReviewImageRepository reviewImageRepository;
    private final String publicBaseUrl;

    public ReviewImageService(
            ReviewImageRepository reviewImageRepository,
            @Value("${app.r2.public-base-url}") String publicBaseUrl
    ) {
        this.reviewImageRepository = reviewImageRepository;
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    @Transactional(readOnly = true)
    public List<PublicReviewImageResponse> getPublicReviewImages() {
        return reviewImageRepository
                .findByIsActiveTrueOrderBySortOrderAscCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private PublicReviewImageResponse mapToResponse(
            ReviewImage reviewImage
    ) {
        return new PublicReviewImageResponse(
                reviewImage.getId(),
                publicBaseUrl + "/" + reviewImage.getObjectKey(),
                reviewImage.getAltText()
        );
    }
}
