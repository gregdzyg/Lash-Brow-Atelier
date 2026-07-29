package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.atelierbypt.backend.dto.AppointmentRequest;
import pl.atelierbypt.backend.dto.AppointmentResponse;
import pl.atelierbypt.backend.entity.Appointment;
import pl.atelierbypt.backend.entity.AvailabilityException;
import pl.atelierbypt.backend.entity.Client;
import pl.atelierbypt.backend.entity.OfferItem;
import pl.atelierbypt.backend.entity.WorkingHours;
import pl.atelierbypt.backend.enums.AppointmentStatus;
import pl.atelierbypt.backend.enums.AvailabilityExceptionType;
import pl.atelierbypt.backend.exception.AppointmentBadRequestException;
import pl.atelierbypt.backend.exception.AppointmentTimeConflictException;
import pl.atelierbypt.backend.repository.AppointmentRepository;
import pl.atelierbypt.backend.repository.AvailabilityExceptionRepository;
import pl.atelierbypt.backend.repository.ClientRepository;
import pl.atelierbypt.backend.repository.OfferItemRepository;
import pl.atelierbypt.backend.repository.WorkingHoursRepository;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceAvailabilityTest {

    private static final ZoneId ZONE = ZoneId.of("Europe/Warsaw");
    private static final Instant FIXED_INSTANT = ZonedDateTime.of(
            2026, 7, 29, 10, 0, 0, 0, ZONE
    ).toInstant();
    private static final LocalDate MONDAY = LocalDate.of(2026, 8, 3);
    private static final Long CLIENT_ID = 1L;
    private static final Long OFFER_ITEM_ID = 2L;

    @Mock
    private AvailabilityExceptionRepository availabilityExceptionRepository;
    @Mock
    private WorkingHoursRepository workingHoursRepository;
    @Mock
    private OfferItemRepository offerItemRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private AppointmentRepository appointmentRepository;

    private AppointmentService appointmentService;
    private Client client;
    private OfferItem offerItem;

    @BeforeEach
    void setUp() {
        Clock applicationClock = Clock.fixed(FIXED_INSTANT, ZONE);
        appointmentService = new AppointmentService(
                availabilityExceptionRepository,
                workingHoursRepository,
                offerItemRepository,
                clientRepository,
                appointmentRepository,
                applicationClock
        );

        client = createClient();
        offerItem = createOfferItem();
    }

    @Test
    void shouldCreateAppointmentInsideAvailableWorkingHours() {
        AppointmentRequest request = createRequest(LocalTime.of(10, 0), 120);
        prepareCreateDependencies();
        prepareAvailableMonday();
        when(appointmentRepository.save(org.mockito.ArgumentMatchers.any(Appointment.class)))
                .thenAnswer(invocation -> {
                    Appointment appointment = invocation.getArgument(0);
                    appointment.setId(10L);
                    return appointment;
                });

        AppointmentResponse result = appointmentService.createAppointment(request);

        assertThat(result.id()).isEqualTo(10L);
        assertThat(result.appointmentDate()).isEqualTo(MONDAY);
        assertThat(result.startTime()).isEqualTo(LocalTime.of(10, 0));
        assertThat(result.durationMinutes()).isEqualTo(120);
    }

    @Test
    void shouldRejectAppointmentOutsideWorkingHours() {
        AppointmentRequest request = createRequest(LocalTime.of(16, 0), 120);
        prepareCreateDependencies();
        prepareAvailableMonday();

        assertThatThrownBy(() -> appointmentService.createAppointment(request))
                .isInstanceOf(AppointmentBadRequestException.class)
                .hasMessage("Wizyta nie może zostać umówiona poza czasem dostępności salonu.");
    }

    @Test
    void shouldRejectAppointmentDuringBlockedTime() {
        AppointmentRequest request = createRequest(LocalTime.of(11, 0), 120);
        AvailabilityException blocked = createException(
                AvailabilityExceptionType.BLOCKED,
                LocalTime.of(12, 0),
                LocalTime.of(13, 0)
        );
        prepareCreateDependencies();
        when(workingHoursRepository.findByDayOfWeekAndIsActiveTrue(DayOfWeek.MONDAY))
                .thenReturn(Optional.of(createWorkingMonday()));
        when(availabilityExceptionRepository.findByDateAndIsActiveTrue(MONDAY))
                .thenReturn(List.of(blocked));

        assertThatThrownBy(() -> appointmentService.createAppointment(request))
                .isInstanceOf(AppointmentBadRequestException.class)
                .hasMessage("Wizyta koliduje z blokadą dostępności salonu.");
    }

    @Test
    void shouldRejectAppointmentOnClosedDay() {
        AppointmentRequest request = createRequest(LocalTime.of(10, 0), 120);
        AvailabilityException closedDay = createException(
                AvailabilityExceptionType.CLOSED_DAY,
                null,
                null
        );
        prepareCreateDependencies();
        when(workingHoursRepository.findByDayOfWeekAndIsActiveTrue(DayOfWeek.MONDAY))
                .thenReturn(Optional.of(createWorkingMonday()));
        when(availabilityExceptionRepository.findByDateAndIsActiveTrue(MONDAY))
                .thenReturn(List.of(closedDay));

        assertThatThrownBy(() -> appointmentService.createAppointment(request))
                .isInstanceOf(AppointmentBadRequestException.class)
                .hasMessage("Nie można utworzyć wizyty w dzień zamknięcia salonu.");
    }

    @Test
    void shouldRejectAppointmentThatCollidesWithScheduledAppointment() {
        AppointmentRequest request = createRequest(LocalTime.of(11, 0), 120);
        Appointment existingAppointment = createAppointment(
                20L,
                LocalTime.of(12, 0),
                120
        );
        prepareCreateDependencies();
        prepareAvailableMonday();
        when(appointmentRepository.findScheduledActiveByDate(MONDAY))
                .thenReturn(List.of(existingAppointment));

        assertThatThrownBy(() -> appointmentService.createAppointment(request))
                .isInstanceOf(AppointmentTimeConflictException.class)
                .hasMessage("Termin wizyty koliduje z istniejącymi.");
    }

    @Test
    void shouldIgnoreUpdatedAppointmentWhenCheckingItsOwnTimeRange() {
        Appointment appointment = createAppointment(
                20L,
                LocalTime.of(10, 0),
                120
        );
        AppointmentRequest request = createRequest(LocalTime.of(10, 0), 120);

        when(appointmentRepository.findByIdAndIsActiveTrue(20L))
                .thenReturn(Optional.of(appointment));
        when(clientRepository.findByIdAndIsActiveTrue(CLIENT_ID))
                .thenReturn(Optional.of(client));
        when(offerItemRepository.findByIdAndIsActiveTrue(OFFER_ITEM_ID))
                .thenReturn(Optional.of(offerItem));
        prepareAvailableMonday();
        when(appointmentRepository.findScheduledActiveByDate(MONDAY))
                .thenReturn(List.of(appointment));
        when(appointmentRepository.save(appointment)).thenReturn(appointment);

        AppointmentResponse result = appointmentService.updateAppointment(20L, request);

        assertThat(result.id()).isEqualTo(20L);
        assertThat(result.startTime()).isEqualTo(LocalTime.of(10, 0));
    }

    private void prepareCreateDependencies() {
        when(clientRepository.findByIdAndIsActiveTrue(CLIENT_ID))
                .thenReturn(Optional.of(client));
        when(offerItemRepository.findByIdAndIsActiveTrue(OFFER_ITEM_ID))
                .thenReturn(Optional.of(offerItem));
    }

    private void prepareAvailableMonday() {
        when(workingHoursRepository.findByDayOfWeekAndIsActiveTrue(DayOfWeek.MONDAY))
                .thenReturn(Optional.of(createWorkingMonday()));
        when(availabilityExceptionRepository.findByDateAndIsActiveTrue(MONDAY))
                .thenReturn(List.of());
    }

    private AppointmentRequest createRequest(LocalTime startTime, int durationMinutes) {
        return new AppointmentRequest(
                CLIENT_ID,
                OFFER_ITEM_ID,
                MONDAY,
                startTime,
                durationMinutes,
                BigDecimal.valueOf(200),
                null
        );
    }

    private WorkingHours createWorkingMonday() {
        WorkingHours workingHours = new WorkingHours();
        workingHours.setDayOfWeek(DayOfWeek.MONDAY);
        workingHours.setStartTime(LocalTime.of(8, 0));
        workingHours.setEndTime(LocalTime.of(17, 0));
        workingHours.setWorkingDay(true);
        return workingHours;
    }

    private AvailabilityException createException(
            AvailabilityExceptionType type,
            LocalTime startTime,
            LocalTime endTime
    ) {
        AvailabilityException exception = new AvailabilityException();
        exception.setDate(MONDAY);
        exception.setType(type);
        exception.setStartTime(startTime);
        exception.setEndTime(endTime);
        return exception;
    }

    private Appointment createAppointment(
            Long id,
            LocalTime startTime,
            int durationMinutes
    ) {
        Appointment appointment = new Appointment();
        appointment.setId(id);
        appointment.setClient(client);
        appointment.setOfferItem(offerItem);
        appointment.setAppointmentDate(MONDAY);
        appointment.setStartTime(startTime);
        appointment.setDurationMinutes(durationMinutes);
        appointment.setPrice(BigDecimal.valueOf(200));
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setActive(true);
        return appointment;
    }

    private Client createClient() {
        Client result = new Client();
        result.setId(CLIENT_ID);
        result.setFirstName("Anna");
        result.setLastName("Kowalska");
        result.setPhoneNumber("123456789");
        result.setActive(true);
        return result;
    }

    private OfferItem createOfferItem() {
        OfferItem result = new OfferItem();
        result.setId(OFFER_ITEM_ID);
        result.setName("Stylizacja rzęs");
        result.setDurationMinutes(120);
        result.setBasePrice(BigDecimal.valueOf(200));
        result.setActive(true);
        return result;
    }
}
