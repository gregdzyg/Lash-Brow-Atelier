package pl.atelierbypt.backend.repository;

import org.springframework.data.repository.Repository;
import pl.atelierbypt.backend.entity.Client;

import java.util.List;
import java.util.Optional;

public interface ClientRepository extends Repository<Client, Long> {

    Client save(Client client);
    Optional<Client> findById(Long id);
    List<Client> findByIsActiveTrue();
    Optional<Client> findByPhoneNumber(String phoneNumber);

}
