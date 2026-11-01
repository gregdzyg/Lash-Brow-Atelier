package pl.atelierbypt.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import pl.atelierbypt.backend.dto.GalleryImageResponse;
import pl.atelierbypt.backend.service.GalleryImageManagementService;

@RestController
@RequestMapping("/api/admin/gallery-images")
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.r2", name = "enabled", havingValue = "true")
public class GalleryImageController {

    private final GalleryImageManagementService galleryImageManagementService;

    @PostMapping
    public ResponseEntity<GalleryImageResponse> createGalleryImage(
            @RequestParam MultipartFile file,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String altText
    ) {
        GalleryImageResponse response = galleryImageManagementService
                .createGalleryImage(file, title, altText);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
