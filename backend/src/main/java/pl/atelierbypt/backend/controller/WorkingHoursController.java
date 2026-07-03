package pl.atelierbypt.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.atelierbypt.backend.dto.WorkingHoursRequest;
import pl.atelierbypt.backend.dto.WorkingHoursResponse;
import pl.atelierbypt.backend.service.WorkingHoursService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/working-hours")
@RequiredArgsConstructor
public class WorkingHoursController {

    private final WorkingHoursService workingHoursService;

    @GetMapping
    public ResponseEntity<List<WorkingHoursResponse>> getAllWorkingHours() {
        return ResponseEntity.ok(workingHoursService.getWorkingHours());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkingHoursResponse> getWorkingHours(@PathVariable Long id) {
        return ResponseEntity.ok(workingHoursService.getWorkingHoursById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkingHoursResponse> updateWorkingHours(@PathVariable Long id,
                                                                   @Valid
                                                                   @RequestBody WorkingHoursRequest request) {
        return ResponseEntity.ok(workingHoursService.updateWorkingHours(id, request));
    }
}
