package pl.atelierbypt.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.atelierbypt.backend.dto.AboutContentRequest;
import pl.atelierbypt.backend.dto.AboutContentResponse;
import pl.atelierbypt.backend.service.AboutContentService;

@RestController
@RequestMapping("/api/admin/about-content")
@RequiredArgsConstructor
public class AboutContentController {

    private final AboutContentService aboutContentService;

    @GetMapping
    public ResponseEntity<AboutContentResponse> getAboutContent() {
        return ResponseEntity.ok(aboutContentService.getAboutContent());
    }

    @PutMapping
    public ResponseEntity<AboutContentResponse> updateAboutContent(
            @Valid @RequestBody AboutContentRequest request
    ) {
        return ResponseEntity.ok(
                aboutContentService.updateAboutContent(request)
        );
    }
}
