package pl.atelierbypt.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pl.atelierbypt.backend.dto.QualificationResponse;
import pl.atelierbypt.backend.dto.QualificationSectionResponse;
import pl.atelierbypt.backend.service.QualificationService;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PublicQualificationControllerTest {

    private QualificationService qualificationService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        qualificationService = mock(QualificationService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(
                new PublicQualificationController(qualificationService)
        ).build();
    }

    @Test
    void shouldReturnPublicQualificationSection() throws Exception {
        when(qualificationService.getPublicQualificationSection())
                .thenReturn(new QualificationSectionResponse(
                        "Rozwój i doświadczenie",
                        "Moje kwalifikacje",
                        "Opis sekcji.",
                        List.of(new QualificationResponse(
                                1L,
                                "Stylizacja rzęs 1:1",
                                "Technika klasyczna.",
                                null
                        ))
                ));

        mockMvc.perform(get("/api/public/qualifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eyebrow")
                        .value("Rozwój i doświadczenie"))
                .andExpect(jsonPath("$.title")
                        .value("Moje kwalifikacje"))
                .andExpect(jsonPath("$.qualifications[0].id").value(1))
                .andExpect(jsonPath("$.qualifications[0].title")
                        .value("Stylizacja rzęs 1:1"));
    }
}
