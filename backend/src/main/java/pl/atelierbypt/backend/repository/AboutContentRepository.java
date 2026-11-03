package pl.atelierbypt.backend.repository;

import org.springframework.data.repository.Repository;
import pl.atelierbypt.backend.entity.AboutContent;

import java.util.Optional;

public interface AboutContentRepository extends Repository<AboutContent, Long> {

    Optional<AboutContent> findById(Long id);

    AboutContent save(AboutContent aboutContent);
}
