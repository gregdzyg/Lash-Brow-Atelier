package pl.atelierbypt.backend.repository;

import org.springframework.data.repository.Repository;
import pl.atelierbypt.backend.entity.GalleryImage;

import java.util.List;
import java.util.Optional;

public interface GalleryImageRepository extends Repository<GalleryImage, Long> {

    GalleryImage save(GalleryImage galleryImage);

    GalleryImage saveAndFlush(GalleryImage galleryImage);

    List<GalleryImage> saveAll(Iterable<GalleryImage> galleryImages);

    void delete(GalleryImage galleryImage);

    Optional<GalleryImage> findById(Long id);

    long count();

    List<GalleryImage> findAllByOrderBySortOrderAscCreatedAtDesc();

    List<GalleryImage> findByIsActiveTrueOrderBySortOrderAscCreatedAtDesc();
}
