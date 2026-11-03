package pl.atelierbypt.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pl.atelierbypt.backend.dto.AboutPortraitResponse;
import pl.atelierbypt.backend.service.AboutPortraitManagementService;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AboutPortraitControllerTest {

    private AboutPortraitManagementService aboutPortraitManagementService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        aboutPortraitManagementService = mock(
                AboutPortraitManagementService.class
        );
        mockMvc = MockMvcBuilders.standaloneSetup(
                new AboutPortraitController(aboutPortraitManagementService)
        ).build();
    }

    @Test
    void shouldReplaceAboutPortrait() throws Exception {
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "portrait.jpg",
                "image/jpeg",
                new byte[]{1, 2, 3}
        );
        when(aboutPortraitManagementService.replaceAboutPortrait(image))
                .thenReturn(new AboutPortraitResponse(
                        "https://example.r2.dev/about/portrait.jpg"
                ));

        mockMvc.perform(multipart("/api/admin/about-portrait")
                        .file(image)
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl").value(
                        "https://example.r2.dev/about/portrait.jpg"
                ));

        verify(aboutPortraitManagementService).replaceAboutPortrait(image);
    }
}
