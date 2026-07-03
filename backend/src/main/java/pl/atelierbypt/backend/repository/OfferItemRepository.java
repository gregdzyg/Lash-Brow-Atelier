package pl.atelierbypt.backend.repository;

import org.springframework.data.repository.Repository;
import pl.atelierbypt.backend.entity.OfferItem;
import pl.atelierbypt.backend.enums.OfferItemCategory;

import java.util.List;
import java.util.Optional;

public interface OfferItemRepository extends Repository<OfferItem, Long> {

    Optional<OfferItem> findByIdAndIsActiveTrue(Long id);

    List<OfferItem> findByIsActiveTrue();

    List<OfferItem> findByCategoryAndIsActiveTrue(OfferItemCategory category);

    Optional<OfferItem> findByNameAndIsActiveTrue(String name);

    OfferItem save(OfferItem offerItem);

}
