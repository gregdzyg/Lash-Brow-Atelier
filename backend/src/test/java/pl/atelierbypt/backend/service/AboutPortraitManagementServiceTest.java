package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.multipart.MultipartFile;
import pl.atelierbypt.backend.dto.AboutPortraitResponse;
import pl.atelierbypt.backend.entity.AboutPortrait;
import pl.atelierbypt.backend.enums.ImageStorageFolder;
import pl.atelierbypt.backend.repository.AboutPortraitRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AboutPortraitManagementServiceTest {

    @Mock
    private AboutPortraitRepository aboutPortraitRepository;
    @Mock
    private R2StorageService r2StorageService;
    @Mock
    private MultipartFile image;

    private AboutPortraitManagementService aboutPortraitManagementService;

    @BeforeEach
    void setUp() {
        aboutPortraitManagementService = new AboutPortraitManagementService(
                aboutPortraitRepository,
                r2StorageService,
                "https://atelier.example.com/"
        );
    }

    @Test
    void shouldSetFirstAboutPortrait() {
        when(aboutPortraitRepository.findById(AboutPortrait.SINGLETON_ID))
                .thenReturn(Optional.empty());
        when(r2StorageService.upload(image, ImageStorageFolder.ABOUT))
                .thenReturn("about/portrait.jpg");
        when(aboutPortraitRepository.saveAndFlush(
                org.mockito.ArgumentMatchers.any(AboutPortrait.class)
        )).thenAnswer(invocation -> invocation.getArgument(0));

        AboutPortraitResponse response = aboutPortraitManagementService
                .replaceAboutPortrait(image);

        assertThat(response.imageUrl())
                .isEqualTo("https://atelier.example.com/about/portrait.jpg");
        verify(r2StorageService, never()).delete(anyString());
    }

    @Test
    void shouldReplacePortraitAndDeletePreviousObject() {
        AboutPortrait aboutPortrait = new AboutPortrait();
        aboutPortrait.setObjectKey("about/previous.jpg");
        when(aboutPortraitRepository.findById(AboutPortrait.SINGLETON_ID))
                .thenReturn(Optional.of(aboutPortrait));
        when(r2StorageService.upload(image, ImageStorageFolder.ABOUT))
                .thenReturn("about/new.jpg");
        when(aboutPortraitRepository.saveAndFlush(aboutPortrait))
                .thenReturn(aboutPortrait);

        AboutPortraitResponse response = aboutPortraitManagementService
                .replaceAboutPortrait(image);

        assertThat(response.imageUrl())
                .isEqualTo("https://atelier.example.com/about/new.jpg");
        verify(r2StorageService).delete("about/previous.jpg");
    }

    @Test
    void shouldDeleteNewUploadWhenDatabaseSaveFails() {
        when(aboutPortraitRepository.findById(AboutPortrait.SINGLETON_ID))
                .thenReturn(Optional.empty());
        when(r2StorageService.upload(image, ImageStorageFolder.ABOUT))
                .thenReturn("about/new.jpg");
        when(aboutPortraitRepository.saveAndFlush(
                org.mockito.ArgumentMatchers.any(AboutPortrait.class)
        )).thenThrow(new DataIntegrityViolationException("DB error"));

        assertThatThrownBy(() -> aboutPortraitManagementService
                .replaceAboutPortrait(image))
                .isInstanceOf(DataIntegrityViolationException.class);

        verify(r2StorageService).delete("about/new.jpg");
    }
}
