package pl.atelierbypt.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pl.atelierbypt.backend.dto.AboutContentResponse;
import pl.atelierbypt.backend.service.AboutContentService;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PublicAboutContentControllerTest {

    private AboutContentService aboutContentService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        aboutContentService = mock(AboutContentService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(
                new PublicAboutContentController(aboutContentService)
        ).build();
    }

    @Test
    void shouldReturnPublicAboutContent() throws Exception {
        when(aboutContentService.getAboutContent()).thenReturn(
                new AboutContentResponse(
                        "Opis Atelier.",
                        "Biografia stylistki."
                )
        );

        mockMvc.perform(get("/api/public/about-content"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.homeIntroduction")
                        .value("Opis Atelier."))
                .andExpect(jsonPath("$.aboutBiography")
                        .value("Biografia stylistki."));
    }
}
