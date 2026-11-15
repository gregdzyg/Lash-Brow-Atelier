package pl.atelierbypt.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import pl.atelierbypt.backend.dto.GalleryImageDetailsRequest;
import pl.atelierbypt.backend.dto.GalleryImageMoveRequest;
import pl.atelierbypt.backend.dto.GalleryImageResponse;
import pl.atelierbypt.backend.dto.GalleryImageVisibilityRequest;
import pl.atelierbypt.backend.service.GalleryImageManagementService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/gallery-images")
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.r2", name = "enabled", havingValue = "true")
public class GalleryImageController {

    private final GalleryImageManagementService galleryImageManagementService;

    @GetMapping
    public ResponseEntity<List<GalleryImageResponse>> getGalleryImages() {
        return ResponseEntity.ok(
                galleryImageManagementService.getGalleryImages()
        );
    }

    @PatchMapping("/{imageId}/visibility")
    public ResponseEntity<GalleryImageResponse> setGalleryImageVisibility(
            @PathVariable Long imageId,
            @Valid @RequestBody GalleryImageVisibilityRequest request
    ) {
        return ResponseEntity.ok(
                galleryImageManagementService.setGalleryImageVisibility(
                        imageId,
                        request.active()
                )
        );
    }

    @PatchMapping("/{imageId}")
    public ResponseEntity<GalleryImageResponse> updateGalleryImageDetails(
            @PathVariable Long imageId,
            @Valid @RequestBody GalleryImageDetailsRequest request
    ) {
        return ResponseEntity.ok(
                galleryImageManagementService.updateGalleryImageDetails(
                        imageId,
                        request.title(),
                        request.altText()
                )
        );
    }

    @PatchMapping("/{imageId}/position")
    public ResponseEntity<List<GalleryImageResponse>> moveGalleryImage(
            @PathVariable Long imageId,
            @Valid @RequestBody GalleryImageMoveRequest request
    ) {
        return ResponseEntity.ok(
                galleryImageManagementService.moveGalleryImage(
                        imageId,
                        request.direction()
                )
        );
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteGalleryImage(
            @PathVariable Long imageId
    ) {
        galleryImageManagementService.deleteGalleryImage(imageId);
        return ResponseEntity.noContent().build();
    }

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
