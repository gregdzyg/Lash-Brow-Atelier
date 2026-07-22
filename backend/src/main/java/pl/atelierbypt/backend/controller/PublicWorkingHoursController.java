package pl.atelierbypt.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.atelierbypt.backend.dto.PublicWorkingHoursResponse;
import pl.atelierbypt.backend.service.WorkingHoursService;

import java.util.List;

@RestController
@RequestMapping("/api/public/working-hours")
@RequiredArgsConstructor
public class PublicWorkingHoursController {

    private final WorkingHoursService workingHoursService;

    @GetMapping
    public ResponseEntity<List<PublicWorkingHoursResponse>> getWorkingHours() {
        return ResponseEntity.ok(workingHoursService.getPublicWorkingHours());
    }
}
