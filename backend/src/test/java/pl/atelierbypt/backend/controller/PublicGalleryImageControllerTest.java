package pl.atelierbypt.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pl.atelierbypt.backend.dto.PublicGalleryImageResponse;
import pl.atelierbypt.backend.dto.PublicGalleryImagesResponse;
import pl.atelierbypt.backend.service.GalleryImageService;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PublicGalleryImageControllerTest {

    private GalleryImageService galleryImageService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        galleryImageService = mock(GalleryImageService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(
                new PublicGalleryImageController(galleryImageService)
        ).build();
    }

    @Test
    void shouldReturnPublicGalleryImagesWithConfigurationState() throws Exception {
        when(galleryImageService.getPublicGalleryImages()).thenReturn(
                new PublicGalleryImagesResponse(
                        true,
                        List.of(new PublicGalleryImageResponse(
                                1L,
                                "https://example.r2.dev/gallery/image.jpg",
                                "Naturalna stylizacja",
                                "Efekt stylizacji rzęs"
                        ))
                )
        );

        mockMvc.perform(get("/api/public/gallery-images"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.configured").value(true))
                .andExpect(jsonPath("$.images[0].id").value(1))
                .andExpect(jsonPath("$.images[0].imageUrl").value(
                        "https://example.r2.dev/gallery/image.jpg"
                ))
                .andExpect(jsonPath("$.images[0].title")
                        .value("Naturalna stylizacja"))
                .andExpect(jsonPath("$.images[0].altText")
                        .value("Efekt stylizacji rzęs"));
    }
}
