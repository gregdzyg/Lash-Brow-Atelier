package pl.atelierbypt.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.atelierbypt.backend.dto.AboutContentRequest;
import pl.atelierbypt.backend.dto.AboutContentResponse;
import pl.atelierbypt.backend.entity.AboutContent;
import pl.atelierbypt.backend.exception.ResourceNotFoundException;
import pl.atelierbypt.backend.repository.AboutContentRepository;

@Service
public class AboutContentService {

    private final AboutContentRepository aboutContentRepository;

    public AboutContentService(AboutContentRepository aboutContentRepository) {
        this.aboutContentRepository = aboutContentRepository;
    }

    @Transactional(readOnly = true)
    public AboutContentResponse getAboutContent() {
        return mapToResponse(findAboutContent());
    }

    @Transactional
    public AboutContentResponse updateAboutContent(AboutContentRequest request) {
        AboutContent aboutContent = findAboutContent();
        aboutContent.setHomeIntroduction(request.homeIntroduction().strip());
        aboutContent.setAboutBiography(request.aboutBiography().strip());
        return mapToResponse(aboutContentRepository.save(aboutContent));
    }

    private AboutContent findAboutContent() {
        return aboutContentRepository.findById(AboutContent.SINGLETON_ID)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Nie znaleziono treści sekcji O mnie."
                ));
    }

    private AboutContentResponse mapToResponse(AboutContent aboutContent) {
        return new AboutContentResponse(
                aboutContent.getHomeIntroduction(),
                aboutContent.getAboutBiography()
        );
    }
}
