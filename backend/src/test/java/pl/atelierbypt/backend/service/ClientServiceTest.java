package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.atelierbypt.backend.dto.ClientAppointmentSummaryResponse;
import pl.atelierbypt.backend.dto.ClientDetailsResponse;
import pl.atelierbypt.backend.entity.Appointment;
import pl.atelierbypt.backend.entity.Client;
import pl.atelierbypt.backend.entity.OfferItem;
import pl.atelierbypt.backend.repository.AppointmentRepository;
import pl.atelierbypt.backend.repository.ClientRepository;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    private static final ZoneId ZONE = ZoneId.of("Europe/Warsaw");
    private static final Instant FIXED_INSTANT = ZonedDateTime.of(
            2026, 8, 4, 10, 0, 0, 0, ZONE
    ).toInstant();
    private static final LocalDate TODAY = LocalDate.of(2026, 8, 4);
    private static final LocalDate THREE_MONTHS_FROM_TODAY = LocalDate.of(2026, 11, 4);
    private static final Long CLIENT_ID = 1L;

    @Mock
    private ClientRepository clientRepository;
    @Mock
    private AppointmentRepository appointmentRepository;

    private ClientService clientService;

    @BeforeEach
    void setUp() {
        clientService = new ClientService(
                clientRepository,
                appointmentRepository,
                Clock.fixed(FIXED_INSTANT, ZONE)
        );
    }

    @Test
    void shouldReturnClientDetailsWithAppointmentsFromNextThreeMonths() {
        Client client = createClient();
        Appointment appointment = createAppointment();

        when(clientRepository.findByIdAndIsActiveTrue(CLIENT_ID))
                .thenReturn(Optional.of(client));
        when(appointmentRepository.findScheduledActiveByClientIdBetweenDates(
                CLIENT_ID,
                TODAY,
                THREE_MONTHS_FROM_TODAY
        )).thenReturn(List.of(appointment));

        ClientDetailsResponse result = clientService.getClientById(CLIENT_ID);

        assertThat(result.id()).isEqualTo(CLIENT_ID);
        assertThat(result.firstName()).isEqualTo("Anna");
        assertThat(result.upcomingAppointments()).containsExactly(
                new ClientAppointmentSummaryResponse(
                        10L,
                        "Stylizacja rzęs",
                        LocalDate.of(2026, 8, 10),
                        LocalTime.of(12, 30),
                        120
                )
        );
        verify(appointmentRepository).findScheduledActiveByClientIdBetweenDates(
                CLIENT_ID,
                TODAY,
                THREE_MONTHS_FROM_TODAY
        );
    }

    private Client createClient() {
        Client client = new Client();
        client.setId(CLIENT_ID);
        client.setFirstName("Anna");
        client.setLastName("Kowalska");
        client.setPhoneNumber("123456789");
        client.setEmail("anna@example.com");
        client.setInstagramUsername("anna");
        client.setNotes("Stała klientka");
        client.setActive(true);
        return client;
    }

    private Appointment createAppointment() {
        OfferItem offerItem = new OfferItem();
        offerItem.setName("Stylizacja rzęs");

        Appointment appointment = new Appointment();
        appointment.setId(10L);
        appointment.setOfferItem(offerItem);
        appointment.setAppointmentDate(LocalDate.of(2026, 8, 10));
        appointment.setStartTime(LocalTime.of(12, 30));
        appointment.setDurationMinutes(120);
        return appointment;
    }
}
