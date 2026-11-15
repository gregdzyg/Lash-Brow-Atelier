package pl.atelierbypt.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pl.atelierbypt.backend.dto.AboutContentRequest;
import pl.atelierbypt.backend.dto.AboutContentResponse;
import pl.atelierbypt.backend.service.AboutContentService;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AboutContentControllerTest {

    private AboutContentService aboutContentService;
    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        aboutContentService = mock(AboutContentService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(
                new AboutContentController(aboutContentService)
        ).build();
    }

    @Test
    void shouldReturnAboutContentForAdmin() throws Exception {
        when(aboutContentService.getAboutContent()).thenReturn(response());

        mockMvc.perform(get("/api/admin/about-content"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.homeIntroduction")
                        .value("Pierwszy akapit.\n\nDrugi akapit."))
                .andExpect(jsonPath("$.aboutBiography")
                        .value("Biografia stylistki."));
    }

    @Test
    void shouldUpdateAboutContent() throws Exception {
        AboutContentRequest request = new AboutContentRequest(
                "Pierwszy akapit.\n\nDrugi akapit.",
                "Biografia stylistki."
        );
        when(aboutContentService.updateAboutContent(request))
                .thenReturn(response());

        mockMvc.perform(put("/api/admin/about-content")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.aboutBiography")
                        .value("Biografia stylistki."));

        verify(aboutContentService).updateAboutContent(request);
    }

    private AboutContentResponse response() {
        return new AboutContentResponse(
                "Pierwszy akapit.\n\nDrugi akapit.",
                "Biografia stylistki."
        );
    }
}
