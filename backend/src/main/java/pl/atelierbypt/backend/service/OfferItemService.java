package pl.atelierbypt.backend.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import pl.atelierbypt.backend.dto.OfferItemRequest;
import pl.atelierbypt.backend.dto.OfferItemResponse;
import pl.atelierbypt.backend.dto.PublicOfferItemResponse;
import pl.atelierbypt.backend.entity.OfferItem;
import pl.atelierbypt.backend.enums.OfferItemCategory;
import pl.atelierbypt.backend.exception.OfferItemNameConflictException;
import pl.atelierbypt.backend.exception.OfferItemNotFoundException;
import pl.atelierbypt.backend.repository.OfferItemRepository;

import java.util.List;
import java.util.Comparator;

@Service
@Slf4j
@RequiredArgsConstructor
public class OfferItemService {

    private final OfferItemRepository offerItemRepository;

    public OfferItemResponse getOfferItemById(Long id) {
        OfferItem offerItem = findOfferItemById(id);
        return mapToOfferItemResponse(offerItem);
    }

    public List<OfferItemResponse> getOfferItems(OfferItemCategory category) {
        if(category != null) {
            return offerItemRepository.findByCategoryAndIsActiveTrue(category)
                    .stream().map(this::mapToOfferItemResponse).toList();
        }
        return offerItemRepository.findByIsActiveTrue().stream()
                .map(this::mapToOfferItemResponse
        ).toList();
    }

    public List<PublicOfferItemResponse> getPublicOfferItems() {
        return offerItemRepository.findByIsActiveTrue().stream()
                .sorted(Comparator.comparing(OfferItem::getId))
                .map(this::mapToPublicOfferItemResponse)
                .toList();
    }


    public OfferItemResponse createOfferItem(OfferItemRequest request) {
        if(offerItemRepository.findByNameAndIsActiveTrue(request.name()).isPresent()) {
            throw new OfferItemNameConflictException("Usługa o tej nazwie już istnieje w systemie.");
        }
        OfferItem offerItem = new OfferItem();
        mapRequestToOfferItem(request, offerItem);
        OfferItem savedOfferItem = offerItemRepository.save(offerItem);
        log.info("Created offerItem with id={}", savedOfferItem.getId());
        return mapToOfferItemResponse(savedOfferItem);
    }

    public OfferItemResponse updateOfferItem(Long id, OfferItemRequest request) {
        OfferItem offerItem = findOfferItemById(id);
        offerItemRepository.findByNameAndIsActiveTrue(request.name()).ifPresent(
                existingOfferItem -> {
                    if(!existingOfferItem.getId().equals(id)) {
                        throw new OfferItemNameConflictException("Usługa o tej nazwie już istnieje w systemie.");
                    }
                }
        );
        mapRequestToOfferItem(request, offerItem);
        OfferItem savedOfferItem = offerItemRepository.save(offerItem);
        log.info("Updated offerItem with id={}", savedOfferItem.getId());
        return mapToOfferItemResponse(savedOfferItem);
    }

    public void archiveOfferItem(Long id) {
        OfferItem offerItem = findOfferItemById(id);
        offerItem.setActive(false);
        offerItemRepository.save(offerItem);
        log.info("Archived offerItem with id={}", offerItem.getId());
    }

    private OfferItem findOfferItemById(Long id) {
        return offerItemRepository.findByIdAndIsActiveTrue(id).orElseThrow(() ->
                new OfferItemNotFoundException("Nie znaleziono oferty o id: " + id));
    }

    private OfferItemResponse mapToOfferItemResponse(OfferItem offerItem) {
        return new OfferItemResponse(offerItem.getId(), offerItem.getName(), offerItem.getCategory(),
                offerItem.getDescription(), offerItem.getDurationMinutes(), offerItem.getBasePrice()
        ,offerItem.isActive());
    }

    private PublicOfferItemResponse mapToPublicOfferItemResponse(OfferItem offerItem) {
        return new PublicOfferItemResponse(
                offerItem.getId(),
                offerItem.getName(),
                offerItem.getCategory(),
                offerItem.getDescription(),
                offerItem.getDurationMinutes(),
                offerItem.getBasePrice()
        );
    }

    private void mapRequestToOfferItem(OfferItemRequest request, OfferItem offerItem) {
        offerItem.setName(request.name());
        offerItem.setCategory(request.category());
        offerItem.setDescription(request.description());
        offerItem.setDurationMinutes(request.durationMinutes());
        offerItem.setBasePrice(request.basePrice());

    }
}
