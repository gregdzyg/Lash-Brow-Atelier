package pl.atelierbypt.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.atelierbypt.backend.dto.PublicOfferItemResponse;
import pl.atelierbypt.backend.service.OfferItemService;

import java.util.List;

@RestController
@RequestMapping("/api/public/offer-items")
@RequiredArgsConstructor
public class PublicOfferItemController {

    private final OfferItemService offerItemService;

    @GetMapping
    public ResponseEntity<List<PublicOfferItemResponse>> getOfferItems() {
        return ResponseEntity.ok(offerItemService.getPublicOfferItems());
    }
}
