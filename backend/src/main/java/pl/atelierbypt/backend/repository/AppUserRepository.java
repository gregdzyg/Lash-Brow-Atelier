package pl.atelierbypt.backend.repository;

import org.springframework.data.repository.Repository;
import pl.atelierbypt.backend.entity.AppUser;

import java.util.Optional;

public interface AppUserRepository extends Repository<AppUser, Long> {

    Optional<AppUser> findByUsernameAndIsActiveTrue(String username);
    Optional<AppUser> findByUsername(String username);
    AppUser save(AppUser appUser);
}
