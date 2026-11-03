package pl.atelierbypt.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.atelierbypt.backend.dto.PublicReviewImageResponse;
import pl.atelierbypt.backend.service.ReviewImageService;

import java.util.List;

@RestController
@RequestMapping("/api/public/review-images")
@RequiredArgsConstructor
public class PublicReviewImageController {

    private final ReviewImageService reviewImageService;

    @GetMapping
    public ResponseEntity<List<PublicReviewImageResponse>> getReviewImages() {
        return ResponseEntity.ok(reviewImageService.getPublicReviewImages());
    }
}
