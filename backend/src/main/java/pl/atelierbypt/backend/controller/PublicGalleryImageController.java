package pl.atelierbypt.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.atelierbypt.backend.dto.PublicGalleryImagesResponse;
import pl.atelierbypt.backend.service.GalleryImageService;

@RestController
@RequestMapping("/api/public/gallery-images")
@RequiredArgsConstructor
public class PublicGalleryImageController {

    private final GalleryImageService galleryImageService;

    @GetMapping
    public ResponseEntity<PublicGalleryImagesResponse> getGalleryImages() {
        return ResponseEntity.ok(galleryImageService.getPublicGalleryImages());
    }
}
