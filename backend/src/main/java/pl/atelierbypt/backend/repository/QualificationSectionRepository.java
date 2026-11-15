package pl.atelierbypt.backend.repository;

import org.springframework.data.repository.Repository;
import pl.atelierbypt.backend.entity.QualificationSection;

import java.util.Optional;

public interface QualificationSectionRepository
        extends Repository<QualificationSection, Long> {

    Optional<QualificationSection> findById(Long id);

    QualificationSection save(QualificationSection qualificationSection);
}
