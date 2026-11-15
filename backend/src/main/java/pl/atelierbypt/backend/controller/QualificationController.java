package pl.atelierbypt.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.atelierbypt.backend.dto.AdminQualificationResponse;
import pl.atelierbypt.backend.dto.AdminQualificationSectionResponse;
import pl.atelierbypt.backend.dto.QualificationMoveRequest;
import pl.atelierbypt.backend.dto.QualificationRequest;
import pl.atelierbypt.backend.dto.QualificationSectionRequest;
import pl.atelierbypt.backend.dto.QualificationVisibilityRequest;
import pl.atelierbypt.backend.service.QualificationManagementService;

@RestController
@RequestMapping("/api/admin/qualifications")
@RequiredArgsConstructor
public class QualificationController {

    private final QualificationManagementService qualificationManagementService;

    @GetMapping
    public ResponseEntity<AdminQualificationSectionResponse>
    getQualificationSection() {
        return ResponseEntity.ok(
                qualificationManagementService.getQualificationSection()
        );
    }

    @PutMapping("/section")
    public ResponseEntity<AdminQualificationSectionResponse>
    updateQualificationSection(
            @Valid @RequestBody QualificationSectionRequest request
    ) {
        return ResponseEntity.ok(
                qualificationManagementService
                        .updateQualificationSection(request)
        );
    }

    @PostMapping
    public ResponseEntity<AdminQualificationResponse> createQualification(
            @Valid @RequestBody QualificationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                qualificationManagementService.createQualification(request)
        );
    }

    @PutMapping("/{qualificationId}")
    public ResponseEntity<AdminQualificationResponse> updateQualification(
            @PathVariable Long qualificationId,
            @Valid @RequestBody QualificationRequest request
    ) {
        return ResponseEntity.ok(
                qualificationManagementService.updateQualification(
                        qualificationId,
                        request
                )
        );
    }

    @PatchMapping("/{qualificationId}/visibility")
    public ResponseEntity<AdminQualificationResponse>
    setQualificationVisibility(
            @PathVariable Long qualificationId,
            @Valid @RequestBody QualificationVisibilityRequest request
    ) {
        return ResponseEntity.ok(
                qualificationManagementService.setQualificationVisibility(
                        qualificationId,
                        request.active()
                )
        );
    }

    @PatchMapping("/{qualificationId}/position")
    public ResponseEntity<Void> moveQualification(
            @PathVariable Long qualificationId,
            @Valid @RequestBody QualificationMoveRequest request
    ) {
        qualificationManagementService.moveQualification(
                qualificationId,
                request.direction()
        );
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{qualificationId}")
    public ResponseEntity<Void> deleteQualification(
            @PathVariable Long qualificationId
    ) {
        qualificationManagementService.deleteQualification(qualificationId);
        return ResponseEntity.noContent().build();
    }
}
