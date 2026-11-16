package pl.atelierbypt.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;
import pl.atelierbypt.backend.dto.ClientAppointmentSummaryResponse;
import pl.atelierbypt.backend.dto.ClientDetailsResponse;
import pl.atelierbypt.backend.dto.ClientRequest;
import pl.atelierbypt.backend.dto.ClientResponse;
import pl.atelierbypt.backend.dto.ClientAppointmentHistoryItem;
import pl.atelierbypt.backend.dto.ClientAppointmentHistoryResponse;
import pl.atelierbypt.backend.entity.Appointment;
import pl.atelierbypt.backend.entity.Client;
import pl.atelierbypt.backend.exception.ClientNotFoundException;
import pl.atelierbypt.backend.exception.PhoneNumberConflictException;
import pl.atelierbypt.backend.exception.BadRequestException;
import pl.atelierbypt.backend.repository.AppointmentRepository;
import pl.atelierbypt.backend.repository.ClientRepository;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final AppointmentRepository appointmentRepository;
    private final Clock applicationClock;

    @Transactional(readOnly = true)
    public ClientDetailsResponse getClientById(Long id){
        Client client = findClientById(id);
        LocalDateTime now = LocalDateTime.now(applicationClock);
        LocalDate start = now.toLocalDate();
        LocalDate end = start.plusMonths(6);

        List<ClientAppointmentSummaryResponse> upcomingAppointments = appointmentRepository
                .findScheduledActiveByClientIdBetweenDates(id, start, end)
                .stream()
                .filter(appointment -> !LocalDateTime.of(
                        appointment.getAppointmentDate(),
                        appointment.getStartTime()
                ).isBefore(now))
                .map(this::mapToClientAppointmentSummaryResponse)
                .toList();

        return new ClientDetailsResponse(
                client.getId(),
                client.getFirstName(),
                client.getLastName(),
                client.getPhoneNumber(),
                client.getEmail(),
                client.getInstagramUsername(),
                client.getNotes(),
                client.isActive(),
                upcomingAppointments
        );
    }

    @Transactional(readOnly = true)
    public ClientAppointmentHistoryResponse getAppointmentHistory(Long clientId, int page) {
        if (page < 0 || page > 100_000) {
            throw new BadRequestException("Nieprawidłowy numer strony historii wizyt.");
        }
        findClientById(clientId);
        LocalDateTime now = LocalDateTime.now(applicationClock);
        var appointments = appointmentRepository.findHistoryByClientId(clientId, PageRequest.of(page, 20));
        List<ClientAppointmentHistoryItem> items = appointments.getContent().stream()
                .map(appointment -> new ClientAppointmentHistoryItem(
                        appointment.getId(),
                        appointment.getOfferItem().getName(),
                        appointment.getAppointmentDate(),
                        appointment.getStartTime(),
                        appointment.getDurationMinutes(),
                        appointment.getPrice(),
                        appointment.getStatus(),
                        appointment.isActive(),
                        !LocalDateTime.of(appointment.getAppointmentDate(), appointment.getStartTime())
                                .plusMinutes(appointment.getDurationMinutes()).isAfter(now)
                ))
                .toList();
        return new ClientAppointmentHistoryResponse(items, page, appointments.hasNext());
    }

    public List<ClientResponse> getAllClients(){
        List<Client> clients = clientRepository.findByIsActiveTrue();
        return clients.stream().map(this::mapToClientResponse).toList();
    }

    public ClientResponse createClient(ClientRequest clientRequest){
        if(clientRepository.findByPhoneNumberAndIsActiveTrue(clientRequest.phoneNumber()).isPresent()){
            throw new PhoneNumberConflictException("Podany numer telefonu już istnieje w systemie.");
        }
        Client client = new Client();
        mapRequestToClient(client,  clientRequest);
        Client savedClient = clientRepository.save(client);
        log.info("Client saved with id {} ", savedClient.getId());
        return mapToClientResponse(savedClient);
    }

    public ClientResponse updateClient(Long id, ClientRequest clientRequest){
        Client client = findClientById(id);
        clientRepository.findByPhoneNumberAndIsActiveTrue(clientRequest.phoneNumber()).ifPresent(
                existingClient -> {
                    if(!existingClient.getId().equals(client.getId())){
                        throw new PhoneNumberConflictException("Podany numer telefonu juz  istnieje w systemie.");
                    }
                });
        mapRequestToClient(client,  clientRequest);
        Client savedClient = clientRepository.save(client);
        log.info("Client updated with id={}", savedClient.getId());
        return mapToClientResponse(savedClient);
    }

    public void archiveClient(Long id){
        Client client = findClientById(id);
        client.setActive(false);
        clientRepository.save(client);
        log.info("Client archived with id {} ", id);
    }

    private ClientResponse mapToClientResponse(Client client){
        return new ClientResponse(client.getId(), client.getFirstName(),
                client.getLastName(), client.getPhoneNumber(), client.getEmail(),
                client.getInstagramUsername(), client.getNotes(), client.isActive());
    }

    private ClientAppointmentSummaryResponse mapToClientAppointmentSummaryResponse(
            Appointment appointment
    ) {
        return new ClientAppointmentSummaryResponse(
                appointment.getId(),
                appointment.getOfferItem().getName(),
                appointment.getAppointmentDate(),
                appointment.getStartTime(),
                appointment.getDurationMinutes()
        );
    }

    private Client findClientById(Long id) {
        return clientRepository.findByIdAndIsActiveTrue(id).orElseThrow(() ->
                new ClientNotFoundException("Nie zanleziono klienta o id " + id));
    }

    private void mapRequestToClient(Client client, ClientRequest request) {
        client.setFirstName(request.firstName());
        client.setLastName(request.lastName());
        client.setPhoneNumber(request.phoneNumber());
        client.setEmail(request.email());
        client.setInstagramUsername(request.instagramUsername());
        client.setNotes(request.notes());
    }


}
