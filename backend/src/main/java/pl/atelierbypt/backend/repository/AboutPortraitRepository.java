package pl.atelierbypt.backend.repository;

import org.springframework.data.repository.Repository;
import pl.atelierbypt.backend.entity.AboutPortrait;

import java.util.Optional;

public interface AboutPortraitRepository extends Repository<AboutPortrait, Long> {

    Optional<AboutPortrait> findById(Long id);

    AboutPortrait saveAndFlush(AboutPortrait aboutPortrait);
}
