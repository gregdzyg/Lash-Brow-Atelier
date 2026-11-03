package pl.atelierbypt.backend.repository;

import org.springframework.data.repository.Repository;
import pl.atelierbypt.backend.entity.ReviewImage;

import java.util.List;
import java.util.Optional;

public interface ReviewImageRepository extends Repository<ReviewImage, Long> {

    ReviewImage save(ReviewImage reviewImage);

    List<ReviewImage> saveAll(Iterable<ReviewImage> reviewImages);

    Optional<ReviewImage> findById(Long id);

    List<ReviewImage> findAllByOrderBySortOrderAscCreatedAtDesc();

    List<ReviewImage> findByIsActiveTrueOrderBySortOrderAscCreatedAtDesc();

    void delete(ReviewImage reviewImage);
}
