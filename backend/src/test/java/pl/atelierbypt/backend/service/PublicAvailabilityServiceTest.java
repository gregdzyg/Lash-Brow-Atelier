package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.atelierbypt.backend.dto.AvailableTimeRangeResponse;
import pl.atelierbypt.backend.dto.PublicAvailabilityDayResponse;
import pl.atelierbypt.backend.entity.Appointment;
import pl.atelierbypt.backend.entity.AvailabilityException;
import pl.atelierbypt.backend.entity.WorkingHours;
import pl.atelierbypt.backend.enums.AppointmentStatus;
import pl.atelierbypt.backend.enums.AvailabilityExceptionType;
import pl.atelierbypt.backend.exception.PublicAvailabilityBadRequestException;
import pl.atelierbypt.backend.repository.AppointmentRepository;
import pl.atelierbypt.backend.repository.AvailabilityExceptionRepository;
import pl.atelierbypt.backend.repository.WorkingHoursRepository;

import java.time.*;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PublicAvailabilityServiceTest {

    private static final ZoneId ZONE = ZoneId.of("Europe/Warsaw");
    private static final Instant FIXED_INSTANT = ZonedDateTime.of
                    (2026, 7, 29, 10, 0, 0, 0, ZONE)
            .toInstant();
    private static final LocalDate MONDAY = LocalDate.of(2026, 8, 3);
    private static final LocalTime START_TIME = LocalTime.of(8, 0);
    private static final LocalTime END_TIME = LocalTime.of(17, 0);

    private PublicAvailabilityService publicAvailabilityService;
    private Clock applicationClock;
    @Mock
    private WorkingHoursRepository workingHoursRepository;
    @Mock
    private AvailabilityExceptionRepository availabilityExceptionRepository;
    @Mock
    private AppointmentRepository appointmentRepository;

    @BeforeEach
    void setUp() {
        applicationClock = Clock.fixed(FIXED_INSTANT, ZONE);
        publicAvailabilityService = new PublicAvailabilityService(applicationClock, workingHoursRepository,
                availabilityExceptionRepository, appointmentRepository);
    }

    @Test
    void shouldReturnWorkingHoursAsAvailableRangesWhenDayHasNoExceptionsOrAppointments() {
       //Arrange
        WorkingHours workingHours = createWorkingDay(DayOfWeek.MONDAY, START_TIME, END_TIME);

        when(workingHoursRepository.findByIsActiveTrue()).thenReturn(List.of(workingHours));
        when(availabilityExceptionRepository.findByDateBetweenAndIsActiveTrue(MONDAY, MONDAY))
        .thenReturn(List.of());
        when(appointmentRepository.findActiveBetweenDates(MONDAY, MONDAY)).thenReturn(List.of());

        //Act
        List<PublicAvailabilityDayResponse> result = publicAvailabilityService.getAvailability(MONDAY, MONDAY);

        //Assert
        assertThat(result).hasSize(1);
        PublicAvailabilityDayResponse dayAvailability = result.getFirst();
        assertThat(dayAvailability.date()).isEqualTo(MONDAY);
        assertThat(dayAvailability.availableRanges()).hasSize(1);

        AvailableTimeRangeResponse range =
                dayAvailability.availableRanges().getFirst();

        assertThat(range.startTime()).isEqualTo(LocalTime.of(8, 0));
        assertThat(range.endTime()).isEqualTo(LocalTime.of(17, 0));
    }

    @Test
    void shouldReturnNoAvailableRangesWhenDayIsClosed() {
        //Arrange
        WorkingHours workingHours = createWorkingDay(DayOfWeek.MONDAY, START_TIME, END_TIME);
        AvailabilityException availabilityException = new AvailabilityException();
        availabilityException.setDate(MONDAY);
        availabilityException.setType(AvailabilityExceptionType.CLOSED_DAY);

        when(workingHoursRepository.findByIsActiveTrue()).thenReturn(List.of(workingHours));
        when(availabilityExceptionRepository.findByDateBetweenAndIsActiveTrue(MONDAY, MONDAY))
                .thenReturn(List.of(availabilityException));
        when(appointmentRepository.findActiveBetweenDates(MONDAY, MONDAY)).thenReturn(List.of());

        //Act
        List<PublicAvailabilityDayResponse> result = publicAvailabilityService.getAvailability(MONDAY, MONDAY);

        //Assert
        assertThat(result).hasSize(1);
        PublicAvailabilityDayResponse dayAvailability = result.getFirst();
        assertThat(dayAvailability.date()).isEqualTo(MONDAY);
        assertThat(dayAvailability.availableRanges()).isEmpty();
    }

    @Test
    void shouldReturnTwoCorrectAvailableRangesWhenHoursAreBlockedInBetween() {
        //Arrange
        WorkingHours workingHours = createWorkingDay(DayOfWeek.MONDAY, START_TIME, END_TIME);
        AvailabilityException availabilityException = new AvailabilityException();
        availabilityException.setDate(MONDAY);
        availabilityException.setType(AvailabilityExceptionType.BLOCKED);
        availabilityException.setStartTime(LocalTime.of(12,0));
        availabilityException.setEndTime(LocalTime.of(13,0));

        when(workingHoursRepository.findByIsActiveTrue()).thenReturn(List.of(workingHours));
        when(availabilityExceptionRepository.findByDateBetweenAndIsActiveTrue(MONDAY, MONDAY))
                .thenReturn(List.of(availabilityException));
        when(appointmentRepository.findActiveBetweenDates(MONDAY, MONDAY)).thenReturn(List.of());

        //Act
        List<PublicAvailabilityDayResponse> result = publicAvailabilityService.getAvailability(MONDAY, MONDAY);

        //Assert
        assertThat(result).hasSize(1);
        List<AvailableTimeRangeResponse> timeRanges = result.getFirst().availableRanges();
        assertThat(timeRanges).hasSize(2);
        AvailableTimeRangeResponse timeRange1 = timeRanges.getFirst();
        assertThat(timeRange1.startTime()).isEqualTo(LocalTime.of(8,0));
        assertThat(timeRange1.endTime()).isEqualTo(LocalTime.of(12,0));
        AvailableTimeRangeResponse timeRange2 = timeRanges.getLast();
        assertThat(timeRange2.startTime()).isEqualTo(LocalTime.of(13,0));
        assertThat(timeRange2.endTime()).isEqualTo(LocalTime.of(17,0));
    }

    @Test
    void shouldReturnExtraOpenAvailabilityWhenRegularDayIsNonWorking() {
        //Arrange
        WorkingHours workingHours = createNonWorkingDay(DayOfWeek.MONDAY);
        AvailabilityException availabilityException = new AvailabilityException();
        availabilityException.setDate(MONDAY);
        availabilityException.setType(AvailabilityExceptionType.EXTRA_OPEN);
        availabilityException.setStartTime(LocalTime.of(10,0));
        availabilityException.setEndTime(LocalTime.of(14,0));

        when(workingHoursRepository.findByIsActiveTrue()).thenReturn(List.of(workingHours));
        when(availabilityExceptionRepository.findByDateBetweenAndIsActiveTrue(MONDAY, MONDAY))
        .thenReturn(List.of(availabilityException));
        when(appointmentRepository.findActiveBetweenDates(MONDAY, MONDAY)).thenReturn(List.of());

        //Act
        List<PublicAvailabilityDayResponse> result = publicAvailabilityService.getAvailability(MONDAY, MONDAY);

        //Assert
        assertThat(result).hasSize(1);
        PublicAvailabilityDayResponse dayAvailability = result.getFirst();
        assertThat(dayAvailability.date()).isEqualTo(MONDAY);
        assertThat(dayAvailability.availableRanges()).hasSize(1);
        assertThat(dayAvailability.availableRanges().getFirst().startTime())
        .isEqualTo(LocalTime.of(10,0));
        assertThat(dayAvailability.availableRanges().getLast().endTime())
        .isEqualTo(LocalTime.of(14,0));
    }

    @Test
    void shouldSubtractScheduledAppointmentFromAvailableRanges() {
        // Arrange
        WorkingHours workingHours = createWorkingDay(DayOfWeek.MONDAY, START_TIME, END_TIME);
        Appointment appointment = createAppointment(
                MONDAY,
                LocalTime.of(11, 0),
                120,
                AppointmentStatus.SCHEDULED
        );

        when(workingHoursRepository.findByIsActiveTrue()).thenReturn(List.of(workingHours));
        when(availabilityExceptionRepository.findByDateBetweenAndIsActiveTrue(MONDAY, MONDAY))
                .thenReturn(List.of());
        when(appointmentRepository.findActiveBetweenDates(MONDAY, MONDAY))
                .thenReturn(List.of(appointment));

        // Act
        List<PublicAvailabilityDayResponse> result =
                publicAvailabilityService.getAvailability(MONDAY, MONDAY);

        // Assert
        List<AvailableTimeRangeResponse> availableRanges = result.getFirst().availableRanges();
        assertThat(availableRanges).hasSize(2);
        assertRange(availableRanges.getFirst(), LocalTime.of(8, 0), LocalTime.of(11, 0));
        assertRange(availableRanges.getLast(), LocalTime.of(13, 0), LocalTime.of(17, 0));
    }

    @Test
    void shouldNotSubtractCancelledAppointmentFromAvailableRanges() {
        // Arrange
        WorkingHours workingHours = createWorkingDay(DayOfWeek.MONDAY, START_TIME, END_TIME);
        Appointment appointment = createAppointment(
                MONDAY,
                LocalTime.of(11, 0),
                120,
                AppointmentStatus.CANCELLED
        );

        when(workingHoursRepository.findByIsActiveTrue()).thenReturn(List.of(workingHours));
        when(availabilityExceptionRepository.findByDateBetweenAndIsActiveTrue(MONDAY, MONDAY))
                .thenReturn(List.of());
        when(appointmentRepository.findActiveBetweenDates(MONDAY, MONDAY))
                .thenReturn(List.of(appointment));

        // Act
        List<PublicAvailabilityDayResponse> result =
                publicAvailabilityService.getAvailability(MONDAY, MONDAY);

        // Assert
        List<AvailableTimeRangeResponse> availableRanges = result.getFirst().availableRanges();
        assertThat(availableRanges).hasSize(1);
        assertRange(availableRanges.getFirst(), START_TIME, END_TIME);
    }

    @Test
    void shouldMergeExtraOpenRangeThatTouchesRegularWorkingHours() {
        // Arrange
        WorkingHours workingHours = createWorkingDay(DayOfWeek.MONDAY, START_TIME, END_TIME);
        AvailabilityException extraOpen = new AvailabilityException();
        extraOpen.setDate(MONDAY);
        extraOpen.setType(AvailabilityExceptionType.EXTRA_OPEN);
        extraOpen.setStartTime(END_TIME);
        extraOpen.setEndTime(LocalTime.of(19, 0));

        when(workingHoursRepository.findByIsActiveTrue()).thenReturn(List.of(workingHours));
        when(availabilityExceptionRepository.findByDateBetweenAndIsActiveTrue(MONDAY, MONDAY))
                .thenReturn(List.of(extraOpen));
        when(appointmentRepository.findActiveBetweenDates(MONDAY, MONDAY)).thenReturn(List.of());

        // Act
        List<PublicAvailabilityDayResponse> result =
                publicAvailabilityService.getAvailability(MONDAY, MONDAY);

        // Assert
        List<AvailableTimeRangeResponse> availableRanges = result.getFirst().availableRanges();
        assertThat(availableRanges).hasSize(1);
        assertRange(availableRanges.getFirst(), START_TIME, LocalTime.of(19, 0));
    }

    @Test
    void shouldRemoveElapsedTimeFromTodayAvailability() {
        // Arrange
        LocalDate today = LocalDate.of(2026, 7, 29);
        WorkingHours workingHours = createWorkingDay(DayOfWeek.WEDNESDAY, START_TIME, END_TIME);

        when(workingHoursRepository.findByIsActiveTrue()).thenReturn(List.of(workingHours));
        when(availabilityExceptionRepository.findByDateBetweenAndIsActiveTrue(today, today))
                .thenReturn(List.of());
        when(appointmentRepository.findActiveBetweenDates(today, today)).thenReturn(List.of());

        // Act
        List<PublicAvailabilityDayResponse> result =
                publicAvailabilityService.getAvailability(today, today);

        // Assert
        List<AvailableTimeRangeResponse> availableRanges = result.getFirst().availableRanges();
        assertThat(availableRanges).hasSize(1);
        assertRange(availableRanges.getFirst(), LocalTime.of(10, 0), END_TIME);
    }

    @Test
    void shouldRejectDateRangeWhenEndIsBeforeStart() {
        LocalDate end = MONDAY.minusDays(1);

        assertThatThrownBy(() -> publicAvailabilityService.getAvailability(MONDAY, end))
                .isInstanceOf(PublicAvailabilityBadRequestException.class)
                .hasMessage("Data zakończenia nie może być wcześniejsza niż data rozpoczęcia.");
    }

    private WorkingHours createWorkingDay(DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime) {
        WorkingHours workingHours = new WorkingHours();
        workingHours.setDayOfWeek(dayOfWeek);
        workingHours.setStartTime(startTime);
        workingHours.setEndTime(endTime);
        workingHours.setWorkingDay(true);
        return workingHours;
    }

    private WorkingHours createNonWorkingDay(DayOfWeek dayOfWeek) {
        WorkingHours workingHours = new WorkingHours();
        workingHours.setDayOfWeek(dayOfWeek);
        workingHours.setStartTime(null);
        workingHours.setEndTime(null);
        workingHours.setWorkingDay(false);
        return workingHours;
    }

    private Appointment createAppointment(
            LocalDate date,
            LocalTime startTime,
            int durationMinutes,
            AppointmentStatus status
    ) {
        Appointment appointment = new Appointment();
        appointment.setAppointmentDate(date);
        appointment.setStartTime(startTime);
        appointment.setDurationMinutes(durationMinutes);
        appointment.setStatus(status);
        return appointment;
    }

    private void assertRange(
            AvailableTimeRangeResponse range,
            LocalTime expectedStart,
            LocalTime expectedEnd
    ) {
        assertThat(range.startTime()).isEqualTo(expectedStart);
        assertThat(range.endTime()).isEqualTo(expectedEnd);
    }
}
