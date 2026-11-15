package pl.atelierbypt.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pl.atelierbypt.backend.dto.AboutPortraitResponse;
import pl.atelierbypt.backend.service.AboutPortraitService;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PublicAboutPortraitControllerTest {

    private AboutPortraitService aboutPortraitService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        aboutPortraitService = mock(AboutPortraitService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(
                new PublicAboutPortraitController(aboutPortraitService)
        ).build();
    }

    @Test
    void shouldReturnAboutPortrait() throws Exception {
        when(aboutPortraitService.getAboutPortrait()).thenReturn(
                new AboutPortraitResponse(
                        "https://example.r2.dev/about/portrait.jpg"
                )
        );

        mockMvc.perform(get("/api/public/about-portrait"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl").value(
                        "https://example.r2.dev/about/portrait.jpg"
                ));
    }
}
