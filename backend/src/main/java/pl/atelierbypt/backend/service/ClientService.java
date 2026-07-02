package pl.atelierbypt.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import pl.atelierbypt.backend.dto.ClientRequest;
import pl.atelierbypt.backend.dto.ClientResponse;
import pl.atelierbypt.backend.entity.Client;
import pl.atelierbypt.backend.exception.ClientNotFoundException;
import pl.atelierbypt.backend.repository.ClientRepository;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;

    public ClientResponse getClientById(Long id){
       Client client = findClientById(id);
       return mapToClientResponse(client);
    }

    public List<ClientResponse> getAllClients(){
        List<Client> clients = clientRepository.findByIsActiveTrue();
        return clients.stream().map(this::mapToClientResponse).toList();
    }

    public ClientResponse createClient(ClientRequest clientRequest){
        Client client = new Client();
        mapRequestToClient(client,  clientRequest);
        Client savedClient = clientRepository.save(client);
        log.info("Client saved with id {} ", savedClient.getId());
        return mapToClientResponse(savedClient);
    }

    public ClientResponse updateClient(Long id, ClientRequest clientRequest){
        Client client = findClientById(id);
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

    private Client findClientById(Long id) {
        return clientRepository.findById(id).orElseThrow(() ->
                new ClientNotFoundException("Client with id " + id + " not found"));
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
