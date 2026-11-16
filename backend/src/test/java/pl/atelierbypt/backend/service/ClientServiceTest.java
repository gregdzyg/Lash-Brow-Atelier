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
import pl.atelierbypt.backend.enums.AppointmentStatus;
import pl.atelierbypt.backend.exception.BadRequestException;
import pl.atelierbypt.backend.exception.ClientNotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.SliceImpl;

import java.math.BigDecimal;

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
import static org.mockito.Mockito.verifyNoInteractions;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    private static final ZoneId ZONE = ZoneId.of("Europe/Warsaw");
    private static final Instant FIXED_INSTANT = ZonedDateTime.of(
            2026, 8, 4, 10, 0, 0, 0, ZONE
    ).toInstant();
    private static final LocalDate TODAY = LocalDate.of(2026, 8, 4);
    private static final LocalDate SIX_MONTHS_FROM_TODAY = LocalDate.of(2027, 2, 4);
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
    void shouldReturnUpcomingAppointmentsAndExcludeEarlierAppointmentsFromToday() {
        Client client = createClient();
        Appointment earlierToday = createAppointment(
                9L,
                TODAY,
                LocalTime.of(9, 0)
        );
        Appointment upcomingAppointment = createAppointment(
                10L,
                LocalDate.of(2026, 8, 10),
                LocalTime.of(12, 30)
        );

        when(clientRepository.findByIdAndIsActiveTrue(CLIENT_ID))
                .thenReturn(Optional.of(client));
        when(appointmentRepository.findScheduledActiveByClientIdBetweenDates(
                CLIENT_ID,
                TODAY,
                SIX_MONTHS_FROM_TODAY
        )).thenReturn(List.of(earlierToday, upcomingAppointment));

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
                SIX_MONTHS_FROM_TODAY
        );
    }

    @Test
    void shouldReturnAllStatusesAndArchivedVisitsInHistoryWithPagination() {
        when(clientRepository.findByIdAndIsActiveTrue(CLIENT_ID)).thenReturn(Optional.of(createClient()));
        Appointment future = createAppointment(20L, TODAY.plusDays(1), LocalTime.of(10, 0));
        Appointment ended = createAppointment(19L, TODAY.minusDays(1), LocalTime.of(10, 0));
        Appointment cancelled = createAppointment(18L, TODAY.minusDays(2), LocalTime.of(10, 0));
        cancelled.setStatus(AppointmentStatus.CANCELLED);
        Appointment noShow = createAppointment(17L, TODAY.minusDays(3), LocalTime.of(10, 0));
        noShow.setStatus(AppointmentStatus.NO_SHOW);
        Appointment archived = createAppointment(16L, TODAY.minusDays(4), LocalTime.of(10, 0));
        archived.setActive(false);
        var pageable = PageRequest.of(0, 20);
        when(appointmentRepository.findHistoryByClientId(CLIENT_ID, pageable))
                .thenReturn(new SliceImpl<>(List.of(future, ended, cancelled, noShow, archived), pageable, true));

        var history = clientService.getAppointmentHistory(CLIENT_ID, 0);

        assertThat(history.page()).isZero();
        assertThat(history.hasMore()).isTrue();
        assertThat(history.appointments()).extracting("id").containsExactly(20L, 19L, 18L, 17L, 16L);
        assertThat(history.appointments().getFirst().hasEnded()).isFalse();
        assertThat(history.appointments().get(1).hasEnded()).isTrue();
        assertThat(history.appointments().get(2).status()).isEqualTo(AppointmentStatus.CANCELLED);
        assertThat(history.appointments().get(3).status()).isEqualTo(AppointmentStatus.NO_SHOW);
        assertThat(history.appointments().getLast().active()).isFalse();
        assertThat(history.appointments().getLast().price()).isEqualByComparingTo("120");
    }

    @Test
    void shouldReturnEmptyHistoryPageWithoutMoreResults() {
        when(clientRepository.findByIdAndIsActiveTrue(CLIENT_ID)).thenReturn(Optional.of(createClient()));
        var pageable = PageRequest.of(1, 20);
        when(appointmentRepository.findHistoryByClientId(CLIENT_ID, pageable))
                .thenReturn(new SliceImpl<>(List.of(), pageable, false));

        var history = clientService.getAppointmentHistory(CLIENT_ID, 1);

        assertThat(history.page()).isEqualTo(1);
        assertThat(history.hasMore()).isFalse();
        assertThat(history.appointments()).isEmpty();
    }

    @Test
    void shouldRejectInvalidHistoryPageBeforeQueryingDatabase() {
        assertThatThrownBy(() -> clientService.getAppointmentHistory(CLIENT_ID, -1))
                .isInstanceOf(BadRequestException.class);
        verifyNoInteractions(clientRepository, appointmentRepository);
    }

    @Test
    void shouldNotReadHistoryForMissingClient() {
        when(clientRepository.findByIdAndIsActiveTrue(CLIENT_ID)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> clientService.getAppointmentHistory(CLIENT_ID, 0))
                .isInstanceOf(ClientNotFoundException.class);
        verifyNoInteractions(appointmentRepository);
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

    private Appointment createAppointment(
            Long id,
            LocalDate appointmentDate,
            LocalTime startTime
    ) {
        OfferItem offerItem = new OfferItem();
        offerItem.setName("Stylizacja rzęs");

        Appointment appointment = new Appointment();
        appointment.setId(id);
        appointment.setOfferItem(offerItem);
        appointment.setAppointmentDate(appointmentDate);
        appointment.setStartTime(startTime);
        appointment.setDurationMinutes(120);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setActive(true);
        appointment.setPrice(BigDecimal.valueOf(120));
        return appointment;
    }
}
