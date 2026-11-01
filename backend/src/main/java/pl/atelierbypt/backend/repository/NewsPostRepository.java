package pl.atelierbypt.backend.repository;

import org.springframework.data.repository.Repository;
import pl.atelierbypt.backend.entity.NewsPost;

import java.util.List;

public interface NewsPostRepository extends Repository<NewsPost, Long> {

    NewsPost saveAndFlush(NewsPost newsPost);

    List<NewsPost> findByIsActiveTrueOrderByCreatedAtDesc();
}
