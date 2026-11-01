package pl.atelierbypt.backend.repository;

import org.springframework.data.repository.Repository;
import pl.atelierbypt.backend.entity.NewsPost;

import java.util.List;
import java.util.Optional;

public interface NewsPostRepository extends Repository<NewsPost, Long> {

    NewsPost saveAndFlush(NewsPost newsPost);

    NewsPost save(NewsPost newsPost);

    Optional<NewsPost> findById(Long id);

    List<NewsPost> findAllByOrderByCreatedAtDesc();

    List<NewsPost> findByIsActiveTrueOrderByCreatedAtDesc();
}
