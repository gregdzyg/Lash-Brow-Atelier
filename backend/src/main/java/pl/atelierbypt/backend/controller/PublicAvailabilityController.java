package pl.atelierbypt.backend.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pl.atelierbypt.backend.dto.PublicAvailabilityDayResponse;
import pl.atelierbypt.backend.service.PublicAvailabilityService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/public/availability")
@RequiredArgsConstructor
public class PublicAvailabilityController {

    private final PublicAvailabilityService publicAvailabilityService;

    @GetMapping
    public ResponseEntity<List<PublicAvailabilityDayResponse>> getAvailability(
            @RequestParam LocalDate start,
            @RequestParam LocalDate end
            ) {
        return ResponseEntity.ok(publicAvailabilityService.getAvailability(start, end));
    }
}
