package pl.atelierbypt.backend.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.atelierbypt.backend.dto.AppointmentRequest;
import pl.atelierbypt.backend.dto.AppointmentResponse;
import pl.atelierbypt.backend.dto.PatchAppointmentStatusRequest;
import pl.atelierbypt.backend.dto.PatchAppointmentStatusResponse;
import pl.atelierbypt.backend.dto.SuggestedOfferItemResponse;
import pl.atelierbypt.backend.service.AppointmentService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments(@RequestParam LocalDate start,
                                                                        @RequestParam LocalDate end) {
        return ResponseEntity.ok(appointmentService.getAppointments(start, end));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    @GetMapping("/suggested-offer-items")
    public ResponseEntity<List<SuggestedOfferItemResponse>> getSuggestedOfferItems(
            @RequestParam Long clientId
    ) {
        return ResponseEntity.ok(appointmentService.getSuggestedOfferItems(clientId));
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(@Valid @RequestBody AppointmentRequest appointmentRequest) {

        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.createAppointment(appointmentRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponse> updateAppointment(@PathVariable Long id,
                                                                 @Valid @RequestBody AppointmentRequest appointmentRequest) {
        return ResponseEntity.ok(appointmentService.updateAppointment(id, appointmentRequest));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PatchAppointmentStatusResponse> updateAppointmentStatus(@PathVariable Long id,
                                                                                  @Valid
                                                                                  @RequestBody PatchAppointmentStatusRequest
                                                                                          patchAppointmentStatusRequest) {
        return ResponseEntity.ok(appointmentService.changeAppointmentStatus(id, patchAppointmentStatusRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>  deleteAppointment(@PathVariable Long id) {
        appointmentService.archiveAppointment(id);
        return ResponseEntity.noContent().build();
    }
}
