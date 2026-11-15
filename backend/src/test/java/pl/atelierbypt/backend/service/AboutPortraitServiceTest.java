package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.atelierbypt.backend.dto.AboutPortraitResponse;
import pl.atelierbypt.backend.entity.AboutPortrait;
import pl.atelierbypt.backend.repository.AboutPortraitRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AboutPortraitServiceTest {

    @Mock
    private AboutPortraitRepository aboutPortraitRepository;

    private AboutPortraitService aboutPortraitService;

    @BeforeEach
    void setUp() {
        aboutPortraitService = new AboutPortraitService(
                aboutPortraitRepository,
                "https://atelier.example.com/"
        );
    }

    @Test
    void shouldReturnPublicPortraitUrl() {
        AboutPortrait aboutPortrait = new AboutPortrait();
        aboutPortrait.setObjectKey("about/portrait.jpg");
        when(aboutPortraitRepository.findById(AboutPortrait.SINGLETON_ID))
                .thenReturn(Optional.of(aboutPortrait));

        AboutPortraitResponse response = aboutPortraitService.getAboutPortrait();

        assertThat(response.imageUrl())
                .isEqualTo("https://atelier.example.com/about/portrait.jpg");
    }

    @Test
    void shouldReturnNullUrlWhenPortraitIsNotConfigured() {
        when(aboutPortraitRepository.findById(AboutPortrait.SINGLETON_ID))
                .thenReturn(Optional.empty());

        AboutPortraitResponse response = aboutPortraitService.getAboutPortrait();

        assertThat(response.imageUrl()).isNull();
    }
}
