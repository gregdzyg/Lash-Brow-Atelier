package pl.atelierbypt.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pl.atelierbypt.backend.dto.GalleryImageResponse;
import pl.atelierbypt.backend.service.GalleryImageManagementService;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GalleryImageControllerTest {

    private GalleryImageManagementService galleryImageManagementService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        galleryImageManagementService = mock(GalleryImageManagementService.class);
        GalleryImageController controller =
                new GalleryImageController(galleryImageManagementService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
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
}
