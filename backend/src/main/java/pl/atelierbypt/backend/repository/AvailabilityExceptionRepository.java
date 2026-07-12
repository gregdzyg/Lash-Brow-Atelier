package pl.atelierbypt.backend.repository;

import org.springframework.data.repository.Repository;
import pl.atelierbypt.backend.entity.AvailabilityException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AvailabilityExceptionRepository extends Repository<AvailabilityException, Long> {

    List<AvailabilityException> findByDateBetweenAndIsActiveTrue(LocalDate start, LocalDate end);
    Optional<AvailabilityException> findByIdAndIsActiveTrue(Long id);
    AvailabilityException save(AvailabilityException availabilityException);
    List<AvailabilityException> findByDateAndIsActiveTrue(LocalDate date);
}
