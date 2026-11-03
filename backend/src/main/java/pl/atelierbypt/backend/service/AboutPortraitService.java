package pl.atelierbypt.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.atelierbypt.backend.dto.AboutPortraitResponse;
import pl.atelierbypt.backend.entity.AboutPortrait;
import pl.atelierbypt.backend.repository.AboutPortraitRepository;

@Service
public class AboutPortraitService {

    private final AboutPortraitRepository aboutPortraitRepository;
    private final String publicBaseUrl;

    public AboutPortraitService(
            AboutPortraitRepository aboutPortraitRepository,
            @Value("${app.r2.public-base-url}") String publicBaseUrl
    ) {
        this.aboutPortraitRepository = aboutPortraitRepository;
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    @Transactional(readOnly = true)
    public AboutPortraitResponse getAboutPortrait() {
        return aboutPortraitRepository.findById(AboutPortrait.SINGLETON_ID)
                .map(aboutPortrait -> new AboutPortraitResponse(
                        buildImageUrl(aboutPortrait)
                ))
                .orElseGet(() -> new AboutPortraitResponse(null));
    }

    private String buildImageUrl(AboutPortrait aboutPortrait) {
        return publicBaseUrl + "/" + aboutPortrait.getObjectKey();
    }
}
