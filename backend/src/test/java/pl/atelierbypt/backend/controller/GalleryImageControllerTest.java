package pl.atelierbypt.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pl.atelierbypt.backend.dto.GalleryImageResponse;
import pl.atelierbypt.backend.exception.GlobalExceptionHandler;
import pl.atelierbypt.backend.exception.R2StorageException;
import pl.atelierbypt.backend.service.GalleryImageManagementService;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.http.MediaType.APPLICATION_JSON;

class GalleryImageControllerTest {

    private GalleryImageManagementService galleryImageManagementService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        galleryImageManagementService = mock(GalleryImageManagementService.class);
        GalleryImageController controller =
                new GalleryImageController(galleryImageManagementService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void shouldCreateGalleryImage() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "atelier.jpg",
                "image/jpeg",
                "image-content".getBytes()
        );
        GalleryImageResponse response = new GalleryImageResponse(
                1L,
                "https://example.r2.dev/gallery/image.jpg",
                "Atelier",
                "Wnętrze atelier",
                0,
                true
        );
        when(galleryImageManagementService.createGalleryImage(
                file,
                "Atelier",
                "Wnętrze atelier"
        )).thenReturn(response);

        mockMvc.perform(multipart("/api/admin/gallery-images")
                        .file(file)
                        .param("title", "Atelier")
                        .param("altText", "Wnętrze atelier"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.imageUrl").value(
                        "https://example.r2.dev/gallery/image.jpg"
                ))
                .andExpect(jsonPath("$.title").value("Atelier"))
                .andExpect(jsonPath("$.altText").value("Wnętrze atelier"))
                .andExpect(jsonPath("$.sortOrder").value(0))
                .andExpect(jsonPath("$.isActive").value(true));

        verify(galleryImageManagementService).createGalleryImage(
                file,
                "Atelier",
                "Wnętrze atelier"
        );
    }

    @Test
    void shouldReturnGalleryImages() throws Exception {
        GalleryImageResponse activeImage = new GalleryImageResponse(
                1L,
                "https://example.r2.dev/gallery/active.jpg",
                "Aktywne zdjęcie",
                null,
                0,
                true
        );
        GalleryImageResponse inactiveImage = new GalleryImageResponse(
                2L,
                "https://example.r2.dev/gallery/inactive.jpg",
                "Ukryte zdjęcie",
                null,
                1,
                false
        );
        when(galleryImageManagementService.getGalleryImages())
                .thenReturn(List.of(activeImage, inactiveImage));

        mockMvc.perform(get("/api/admin/gallery-images"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].isActive").value(true))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].isActive").value(false));
    }

    @Test
    void shouldChangeGalleryImageVisibility() throws Exception {
        GalleryImageResponse hiddenImage = new GalleryImageResponse(
                1L,
                "https://example.r2.dev/gallery/image.jpg",
                "Zdjęcie",
                null,
                0,
                false
        );
        when(galleryImageManagementService.setGalleryImageVisibility(1L, false))
                .thenReturn(hiddenImage);

        mockMvc.perform(patch("/api/admin/gallery-images/1/visibility")
                        .contentType(APPLICATION_JSON)
                        .content("{\"active\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.isActive").value(false));

        verify(galleryImageManagementService)
                .setGalleryImageVisibility(1L, false);
    }

    @Test
    void shouldReturnBadGatewayWhenR2UploadFails() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "atelier.jpg",
                "image/jpeg",
                "image-content".getBytes()
        );
        when(galleryImageManagementService.createGalleryImage(
                file,
                null,
                null
        )).thenThrow(new R2StorageException(
                "Nie udało się wysłać zdjęcia.",
                new RuntimeException("R2 unavailable")
        ));

        mockMvc.perform(multipart("/api/admin/gallery-images").file(file))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.status").value(502))
                .andExpect(jsonPath("$.message").value(
                        "Nie udało się wysłać zdjęcia."
                ));
    }
}
