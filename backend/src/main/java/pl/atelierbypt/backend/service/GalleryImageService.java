package pl.atelierbypt.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import pl.atelierbypt.backend.dto.PublicGalleryImageResponse;
import pl.atelierbypt.backend.entity.GalleryImage;
import pl.atelierbypt.backend.repository.GalleryImageRepository;

import java.util.List;

@Service
public class GalleryImageService {

    private final GalleryImageRepository galleryImageRepository;
    private final String publicBaseUrl;

    public GalleryImageService(
            GalleryImageRepository galleryImageRepository,
            @Value("${app.r2.public-base-url}") String publicBaseUrl
    ) {
        this.galleryImageRepository = galleryImageRepository;
        //avoid creating url with "//"
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    public List<PublicGalleryImageResponse> getPublicGalleryImages() {
        return galleryImageRepository.findByIsActiveTrueOrderBySortOrderAscCreatedAtDesc()
                .stream()
                .map(this::mapToPublicGalleryImageResponse)
                .toList();
    }

    private PublicGalleryImageResponse mapToPublicGalleryImageResponse(GalleryImage galleryImage) {
        return new PublicGalleryImageResponse(
                galleryImage.getId(),
                publicBaseUrl + "/" + galleryImage.getObjectKey(),
                galleryImage.getTitle(),
                galleryImage.getAltText()
        );
    }
}
