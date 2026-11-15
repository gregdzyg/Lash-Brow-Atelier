package pl.atelierbypt.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import pl.atelierbypt.backend.dto.AboutPortraitResponse;
import pl.atelierbypt.backend.service.AboutPortraitManagementService;

@RestController
@RequestMapping("/api/admin/about-portrait")
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.r2", name = "enabled", havingValue = "true")
public class AboutPortraitController {

    private final AboutPortraitManagementService aboutPortraitManagementService;

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AboutPortraitResponse> replaceAboutPortrait(
            @RequestParam MultipartFile image
    ) {
        return ResponseEntity.ok(
                aboutPortraitManagementService.replaceAboutPortrait(image)
        );
    }
}
