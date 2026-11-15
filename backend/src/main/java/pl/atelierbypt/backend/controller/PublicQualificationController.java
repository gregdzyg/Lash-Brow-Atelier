package pl.atelierbypt.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.atelierbypt.backend.dto.QualificationSectionResponse;
import pl.atelierbypt.backend.service.QualificationService;

@RestController
@RequestMapping("/api/public/qualifications")
@RequiredArgsConstructor
public class PublicQualificationController {

    private final QualificationService qualificationService;

    @GetMapping
    public ResponseEntity<QualificationSectionResponse> getQualifications() {
        return ResponseEntity.ok(
                qualificationService.getPublicQualificationSection()
        );
    }
}
