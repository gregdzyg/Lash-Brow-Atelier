package pl.atelierbypt.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.atelierbypt.backend.dto.AboutPortraitResponse;
import pl.atelierbypt.backend.service.AboutPortraitService;

@RestController
@RequestMapping("/api/public/about-portrait")
@RequiredArgsConstructor
public class PublicAboutPortraitController {

    private final AboutPortraitService aboutPortraitService;

    @GetMapping
    public ResponseEntity<AboutPortraitResponse> getAboutPortrait() {
        return ResponseEntity.ok(aboutPortraitService.getAboutPortrait());
    }
}
