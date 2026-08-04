package pl.atelierbypt.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.atelierbypt.backend.dto.ClientDetailsResponse;
import pl.atelierbypt.backend.dto.ClientRequest;
import pl.atelierbypt.backend.dto.ClientResponse;
import pl.atelierbypt.backend.service.ClientService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    public ResponseEntity<List<ClientResponse>> getAllClients() {
        return ResponseEntity.ok(clientService.getAllClients());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientDetailsResponse> getClientById(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.getClientById(id));
    }

    @PostMapping
    public ResponseEntity<ClientResponse> createClient(@Valid @RequestBody ClientRequest clientRequest) {
        ClientResponse clientResponse = clientService.createClient(clientRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(clientResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientResponse> updateClient(@PathVariable Long id,
                                                       @Valid @RequestBody ClientRequest clientRequest) {
        return ResponseEntity.ok(clientService.updateClient(id, clientRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> archiveClient(@PathVariable Long id) {
        clientService.archiveClient(id);
        return ResponseEntity.noContent().build();
    }
}
