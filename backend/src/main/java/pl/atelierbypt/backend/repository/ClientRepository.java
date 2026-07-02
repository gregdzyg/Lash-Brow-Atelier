package pl.atelierbypt.backend.repository;

import org.springframework.data.repository.Repository;
import pl.atelierbypt.backend.entity.Client;

import java.util.List;
import java.util.Optional;

public interface ClientRepository extends Repository<Client, Long> {

    Client save(Client client);
    List<Client> findByIsActiveTrue();
    Optional<Client> findByIdAndIsActiveTrue(Long id);
    Optional<Client> findByPhoneNumberAndIsActiveTrue(String phoneNumber);

}
