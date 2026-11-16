package pl.atelierbypt.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pl.atelierbypt.backend.dto.ClientAppointmentHistoryItem;
import pl.atelierbypt.backend.dto.ClientAppointmentHistoryResponse;
import pl.atelierbypt.backend.enums.AppointmentStatus;
import pl.atelierbypt.backend.exception.BadRequestException;
import pl.atelierbypt.backend.exception.GlobalExceptionHandler;
import pl.atelierbypt.backend.service.ClientService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ClientAppointmentHistoryControllerTest {
    private final ClientService service = mock(ClientService.class);
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ClientController(service))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @Test
    void shouldReturnArchivedVisitAndStatusOnDefaultFirstPage() throws Exception {
        when(service.getAppointmentHistory(1L, 0)).thenReturn(new ClientAppointmentHistoryResponse(
                List.of(new ClientAppointmentHistoryItem(10L, "Stylizacja", LocalDate.of(2026, 10, 1),
                        LocalTime.of(10, 0), 60, BigDecimal.valueOf(100), AppointmentStatus.NO_SHOW, false, true)),
                0, true
        ));
        mockMvc.perform(get("/api/admin/clients/1/appointments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appointments[0].id").value(10))
                .andExpect(jsonPath("$.appointments[0].status").value("NO_SHOW"))
                .andExpect(jsonPath("$.appointments[0].active").value(false))
                .andExpect(jsonPath("$.appointments[0].price").value(100))
                .andExpect(jsonPath("$.hasMore").value(true));
    }

    @Test
    void shouldPassRequestedPageToService() throws Exception {
        when(service.getAppointmentHistory(1L, 2))
                .thenReturn(new ClientAppointmentHistoryResponse(List.of(), 2, false));
        mockMvc.perform(get("/api/admin/clients/1/appointments").param("page", "2"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.page").value(2));
    }

    @Test
    void shouldRejectInvalidPage() throws Exception {
        when(service.getAppointmentHistory(1L, -1)).thenThrow(new BadRequestException("Nieprawidłowa strona"));
        mockMvc.perform(get("/api/admin/clients/1/appointments").param("page", "-1"))
                .andExpect(status().isBadRequest());
    }
}
