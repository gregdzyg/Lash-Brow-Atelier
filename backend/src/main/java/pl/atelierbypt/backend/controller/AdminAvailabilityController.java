package pl.atelierbypt.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pl.atelierbypt.backend.dto.AdminAvailabilityDayResponse;
import pl.atelierbypt.backend.service.AdminAvailabilityService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/availability")
@RequiredArgsConstructor
public class AdminAvailabilityController {

    private final AdminAvailabilityService adminAvailabilityService;

    @GetMapping
    public ResponseEntity<List<AdminAvailabilityDayResponse>> getAvailability(
            @RequestParam LocalDate start,
            @RequestParam LocalDate end
    ) {
        return ResponseEntity.ok(
                adminAvailabilityService.getAvailability(start, end)
        );
    }
}
