package pl.atelierbypt.backend.repository;

import org.springframework.data.repository.Repository;
import pl.atelierbypt.backend.entity.Qualification;

import java.util.List;
import java.util.Optional;

public interface QualificationRepository
        extends Repository<Qualification, Long> {

    Qualification save(Qualification qualification);

    List<Qualification> saveAll(Iterable<Qualification> qualifications);

    Optional<Qualification> findById(Long id);

    List<Qualification> findAllByOrderBySortOrderAscCreatedAtAsc();

    List<Qualification> findByIsActiveTrueOrderBySortOrderAscCreatedAtAsc();

    void delete(Qualification qualification);
}
