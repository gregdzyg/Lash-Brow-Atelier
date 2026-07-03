package pl.atelierbypt.backend.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.atelierbypt.backend.dto.OfferItemRequest;
import pl.atelierbypt.backend.dto.OfferItemResponse;
import pl.atelierbypt.backend.enums.OfferItemCategory;
import pl.atelierbypt.backend.service.OfferItemService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/offer-items")
public class OfferItemController {

    private final OfferItemService offerItemService;

    @GetMapping
    public ResponseEntity<List<OfferItemResponse>> getOfferItems(@RequestParam(required = false)
                                                                      OfferItemCategory category) {
        return ResponseEntity.ok(offerItemService.getOfferItems(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfferItemResponse> getOfferItem(@PathVariable Long id) {
        return ResponseEntity.ok(offerItemService.getOfferItemById(id));
    }



    @PostMapping
    public ResponseEntity<OfferItemResponse> createOfferItem(@Valid @RequestBody OfferItemRequest offerItemRequest) {
        OfferItemResponse offerItemResponse = offerItemService.createOfferItem(offerItemRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(offerItemResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OfferItemResponse> updateOfferItem(@Valid @RequestBody OfferItemRequest offerItemRequest,
                                                             @PathVariable Long id) {
        return ResponseEntity.ok(offerItemService.updateOfferItem(id, offerItemRequest));

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> archiveOfferItem(@PathVariable Long id) {
        offerItemService.archiveOfferItem(id);
        return ResponseEntity.noContent().build();
    }
}
