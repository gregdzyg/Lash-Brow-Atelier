package pl.atelierbypt.backend.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.atelierbypt.backend.dto.AvailabilityExceptionRequest;
import pl.atelierbypt.backend.dto.AvailabilityExceptionResponse;
import pl.atelierbypt.backend.service.AvailabilityExceptionService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/availability-exceptions")
public class AvailabilityExceptionController {

    private final AvailabilityExceptionService availabilityExceptionService;

    @GetMapping
    public ResponseEntity<List<AvailabilityExceptionResponse>> getAvailabilityExceptions(
            @RequestParam
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate start,
            @RequestParam
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate end) {
        return ResponseEntity.ok(availabilityExceptionService.getAvailabilityExceptions(start, end));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AvailabilityExceptionResponse> getAvailabilityExceptionById(@PathVariable Long id) {
        return ResponseEntity.ok(availabilityExceptionService.getAvailabilityExceptionById(id));
    }

    @PostMapping
    public ResponseEntity<AvailabilityExceptionResponse> createAvailabilityException(
            @Valid @RequestBody AvailabilityExceptionRequest availabilityExceptionRequest) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(availabilityExceptionService.createAvailabilityException(availabilityExceptionRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AvailabilityExceptionResponse> updateAvailabilityException(
           @PathVariable Long id, @Valid @RequestBody AvailabilityExceptionRequest availabilityExceptionRequest) {
        return ResponseEntity.ok(availabilityExceptionService.updateAvailabilityException(id, availabilityExceptionRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> archiveAvailabilityException(@PathVariable Long id) {
        availabilityExceptionService.archiveAvailabilityException(id);
        return ResponseEntity.noContent().build();
    }

}
