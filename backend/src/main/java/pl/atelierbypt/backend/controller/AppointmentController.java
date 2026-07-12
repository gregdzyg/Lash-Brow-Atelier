package pl.atelierbypt.backend.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.atelierbypt.backend.dto.AppointmentRequest;
import pl.atelierbypt.backend.dto.AppointmentResponse;
import pl.atelierbypt.backend.service.AppointmentService;

@RestController
@RequestMapping("/api/admin/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(@Valid @RequestBody AppointmentRequest appointmentRequest) {

        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.createAppointment(appointmentRequest));
    }
}
