package pl.atelierbypt.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import pl.atelierbypt.backend.dto.ReviewImageDetailsRequest;
import pl.atelierbypt.backend.dto.ReviewImageMoveRequest;
import pl.atelierbypt.backend.dto.ReviewImageResponse;
import pl.atelierbypt.backend.dto.ReviewImageVisibilityRequest;
import pl.atelierbypt.backend.service.ReviewImageManagementService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/review-images")
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.r2", name = "enabled", havingValue = "true")
public class ReviewImageController {

    private final ReviewImageManagementService reviewImageManagementService;

    @GetMapping
    public ResponseEntity<List<ReviewImageResponse>> getReviewImages() {
        return ResponseEntity.ok(
                reviewImageManagementService.getReviewImages()
        );
    }

    @PostMapping
    public ResponseEntity<ReviewImageResponse> createReviewImage(
            @RequestParam MultipartFile file,
            @RequestParam(required = false) String altText
    ) {
        ReviewImageResponse response = reviewImageManagementService
                .createReviewImage(file, altText);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{imageId}")
    public ResponseEntity<ReviewImageResponse> updateReviewImageDetails(
            @PathVariable Long imageId,
            @Valid @RequestBody ReviewImageDetailsRequest request
    ) {
        return ResponseEntity.ok(
                reviewImageManagementService.updateReviewImageDetails(
                        imageId,
                        request.altText()
                )
        );
    }

    @PatchMapping("/{imageId}/visibility")
    public ResponseEntity<ReviewImageResponse> setReviewImageVisibility(
            @PathVariable Long imageId,
            @Valid @RequestBody ReviewImageVisibilityRequest request
    ) {
        return ResponseEntity.ok(
                reviewImageManagementService.setReviewImageVisibility(
                        imageId,
                        request.active()
                )
        );
    }

    @PatchMapping("/{imageId}/position")
    public ResponseEntity<List<ReviewImageResponse>> moveReviewImage(
            @PathVariable Long imageId,
            @Valid @RequestBody ReviewImageMoveRequest request
    ) {
        return ResponseEntity.ok(
                reviewImageManagementService.moveReviewImage(
                        imageId,
                        request.direction()
                )
        );
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteReviewImage(
            @PathVariable Long imageId
    ) {
        reviewImageManagementService.deleteReviewImage(imageId);
        return ResponseEntity.noContent().build();
    }
}
