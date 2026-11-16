package pl.atelierbypt.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pl.atelierbypt.backend.dto.AdminQualificationResponse;
import pl.atelierbypt.backend.dto.AdminQualificationSectionResponse;
import pl.atelierbypt.backend.dto.QualificationMoveRequest;
import pl.atelierbypt.backend.dto.QualificationRequest;
import pl.atelierbypt.backend.dto.QualificationSectionRequest;
import pl.atelierbypt.backend.dto.QualificationVisibilityRequest;
import pl.atelierbypt.backend.enums.QualificationMoveDirection;
import pl.atelierbypt.backend.service.QualificationManagementService;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class QualificationControllerTest {

    private QualificationManagementService qualificationManagementService;
    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        qualificationManagementService = mock(
                QualificationManagementService.class
        );
        mockMvc = MockMvcBuilders.standaloneSetup(
                new QualificationController(qualificationManagementService)
        ).build();
    }

    @Test
    void shouldReturnQualificationSection() throws Exception {
        when(qualificationManagementService.getQualificationSection())
                .thenReturn(sectionResponse());

        mockMvc.perform(get("/api/admin/qualifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Moje kwalifikacje"))
                .andExpect(jsonPath("$.qualifications[0].active")
                        .value(true));
    }

    @Test
    void shouldUpdateQualificationSection() throws Exception {
        QualificationSectionRequest request = new QualificationSectionRequest(
                "Rozwój",
                "Moje kwalifikacje",
                "Opis sekcji."
        );
        when(qualificationManagementService
                .updateQualificationSection(request))
                .thenReturn(sectionResponse());

        mockMvc.perform(put("/api/admin/qualifications/section")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eyebrow").value("Rozwój"));
    }

    @Test
    void shouldCreateAndUpdateQualification() throws Exception {
        QualificationRequest request = new QualificationRequest(
                "Stylizacja rzęs",
                "Opis szkolenia."
        );
        AdminQualificationResponse response = qualificationResponse();
        when(qualificationManagementService.createQualification(request))
                .thenReturn(response);
        when(qualificationManagementService.updateQualification(1L, request))
                .thenReturn(response);

        mockMvc.perform(post("/api/admin/qualifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));

        mockMvc.perform(put("/api/admin/qualifications/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Stylizacja rzęs"));
    }

    @Test
    void shouldChangeVisibilityAndPosition() throws Exception {
        QualificationVisibilityRequest visibilityRequest =
                new QualificationVisibilityRequest(false);
        QualificationMoveRequest moveRequest = new QualificationMoveRequest(
                QualificationMoveDirection.UP
        );
        when(qualificationManagementService.setQualificationVisibility(
                1L,
                false
        )).thenReturn(new AdminQualificationResponse(
                1L,
                "Stylizacja rzęs",
                "Opis szkolenia.",
                0,
                false,
                null
        ));

        mockMvc.perform(patch(
                        "/api/admin/qualifications/1/visibility"
                )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                visibilityRequest
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));

        mockMvc.perform(patch(
                        "/api/admin/qualifications/1/position"
                )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(moveRequest)))
                .andExpect(status().isNoContent());

        verify(qualificationManagementService).moveQualification(
                1L,
                QualificationMoveDirection.UP
        );
    }

    @Test
    void shouldDeleteQualification() throws Exception {
        mockMvc.perform(delete("/api/admin/qualifications/1"))
                .andExpect(status().isNoContent());

        verify(qualificationManagementService).deleteQualification(1L);
    }

    @Test
    void shouldUploadCertificateAndReturnItsPublicUrl() throws Exception {
        MockMultipartFile image = new MockMultipartFile("image", "certificate.jpg", "image/jpeg", new byte[]{1});
        when(qualificationManagementService.replaceCertificate(1L, image))
                .thenReturn(new AdminQualificationResponse(
                        1L, "Szkolenie", "Opis", 0, true,
                        "https://example.r2.dev/certificates/course.jpg"
                ));

        mockMvc.perform(multipart("/api/admin/qualifications/1/certificate")
                        .file(image).with(request -> { request.setMethod("PUT"); return request; }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.certificateUrl").value("https://example.r2.dev/certificates/course.jpg"));
        verify(qualificationManagementService).replaceCertificate(1L, image);
    }

    @Test
    void shouldRemoveOnlyCertificateAttachment() throws Exception {
        when(qualificationManagementService.removeCertificate(1L)).thenReturn(qualificationResponse());
        mockMvc.perform(delete("/api/admin/qualifications/1/certificate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
        verify(qualificationManagementService).removeCertificate(1L);
    }

    private AdminQualificationSectionResponse sectionResponse() {
        return new AdminQualificationSectionResponse(
                "Rozwój",
                "Moje kwalifikacje",
                "Opis sekcji.",
                List.of(qualificationResponse())
        );
    }

    private AdminQualificationResponse qualificationResponse() {
        return new AdminQualificationResponse(
                1L,
                "Stylizacja rzęs",
                "Opis szkolenia.",
                0,
                true,
                null
        );
    }
}
