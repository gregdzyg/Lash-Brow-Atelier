package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.atelierbypt.backend.dto.AboutContentRequest;
import pl.atelierbypt.backend.dto.AboutContentResponse;
import pl.atelierbypt.backend.entity.AboutContent;
import pl.atelierbypt.backend.repository.AboutContentRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AboutContentServiceTest {

    @Mock
    private AboutContentRepository aboutContentRepository;

    private AboutContentService aboutContentService;

    @BeforeEach
    void setUp() {
        aboutContentService = new AboutContentService(aboutContentRepository);
    }

    @Test
    void shouldReturnAboutContent() {
        AboutContent aboutContent = aboutContent();
        when(aboutContentRepository.findById(AboutContent.SINGLETON_ID))
                .thenReturn(Optional.of(aboutContent));

        AboutContentResponse response = aboutContentService.getAboutContent();

        assertThat(response.homeIntroduction())
                .isEqualTo("Pierwszy akapit.\n\nDrugi akapit.");
        assertThat(response.aboutBiography())
                .isEqualTo("Biografia Atelier.");
    }

    @Test
    void shouldUpdateContentAndPreserveParagraphBreaks() {
        AboutContent aboutContent = aboutContent();
        AboutContentRequest request = new AboutContentRequest(
                "  Nowy pierwszy akapit.\n\nNowy drugi akapit.  ",
                "  Nowa biografia.  "
        );
        when(aboutContentRepository.findById(AboutContent.SINGLETON_ID))
                .thenReturn(Optional.of(aboutContent));
        when(aboutContentRepository.save(aboutContent))
                .thenReturn(aboutContent);

        AboutContentResponse response = aboutContentService
                .updateAboutContent(request);

        assertThat(response.homeIntroduction())
                .isEqualTo("Nowy pierwszy akapit.\n\nNowy drugi akapit.");
        assertThat(response.aboutBiography())
                .isEqualTo("Nowa biografia.");
    }

    private AboutContent aboutContent() {
        AboutContent aboutContent = new AboutContent();
        aboutContent.setHomeIntroduction(
                "Pierwszy akapit.\n\nDrugi akapit."
        );
        aboutContent.setAboutBiography("Biografia Atelier.");
        return aboutContent;
    }
}
