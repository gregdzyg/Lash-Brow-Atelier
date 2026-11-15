package pl.atelierbypt.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.atelierbypt.backend.dto.AboutContentResponse;
import pl.atelierbypt.backend.service.AboutContentService;

@RestController
@RequestMapping("/api/public/about-content")
@RequiredArgsConstructor
public class PublicAboutContentController {

    private final AboutContentService aboutContentService;

    @GetMapping
    public ResponseEntity<AboutContentResponse> getAboutContent() {
        return ResponseEntity.ok(aboutContentService.getAboutContent());
    }
}
