package pl.atelierbypt.backend.security;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pl.atelierbypt.backend.config.SecurityConfig;
import pl.atelierbypt.backend.controller.AdminAvailabilityController;
import pl.atelierbypt.backend.controller.PublicAvailabilityController;
import pl.atelierbypt.backend.service.AdminAvailabilityService;
import pl.atelierbypt.backend.service.CustomUserDetailsService;
import pl.atelierbypt.backend.service.JwtService;
import pl.atelierbypt.backend.service.PublicAvailabilityService;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {
        PublicAvailabilityController.class,
        AdminAvailabilityController.class
})
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class,
        RestSecurityErrorHandler.class
})
class SecurityConfigTest {

    private static final LocalDate DATE = LocalDate.of(2026, 8, 3);

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PublicAvailabilityService publicAvailabilityService;
    @MockitoBean
    private AdminAvailabilityService adminAvailabilityService;
    @MockitoBean
    private JwtService jwtService;
    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void shouldAllowPublicEndpointWithoutAuthentication() throws Exception {
        when(publicAvailabilityService.getAvailability(DATE, DATE, 1L))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/public/availability")
                        .param("start", DATE.toString())
                        .param("end", DATE.toString())
                        .param("offerItemId", "1"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void shouldReturnJsonUnauthorizedForAdminEndpointWithoutToken()
            throws Exception {
        mockMvc.perform(get("/api/admin/availability")
                        .param("start", DATE.toString())
                        .param("end", DATE.toString()))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(
                        "application/json"
                ))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value(
                        "Brak lub nieprawidłowe dane uwierzytelniające."
                ));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldAllowAdminEndpointForAdminRole() throws Exception {
        when(adminAvailabilityService.getAvailability(DATE, DATE))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/admin/availability")
                        .param("start", DATE.toString())
                        .param("end", DATE.toString()))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void shouldReturnJsonForbiddenForUserWithoutAdminRole()
            throws Exception {
        mockMvc.perform(get("/api/admin/availability")
                        .param("start", DATE.toString())
                        .param("end", DATE.toString()))
                .andExpect(status().isForbidden())
                .andExpect(content().contentTypeCompatibleWith(
                        "application/json"
                ))
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value(
                        "Brak uprawnień do wykonania tej operacji."
                ));
    }

    @Test
    void shouldReturnJsonUnauthorizedForInvalidToken() throws Exception {
        when(jwtService.extractUsername("invalid-token"))
                .thenThrow(new JwtException("Invalid token"));

        mockMvc.perform(get("/api/admin/availability")
                        .header("Authorization", "Bearer invalid-token")
                        .param("start", DATE.toString())
                        .param("end", DATE.toString()))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(
                        "application/json"
                ))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value(
                        "Token wygasł lub jest nieprawidłowy."
                ));
    }
}
