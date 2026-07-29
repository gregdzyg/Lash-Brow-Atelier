package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.atelierbypt.backend.dto.AdminAvailabilityDayResponse;
import pl.atelierbypt.backend.dto.AvailableTimeRangeResponse;
import pl.atelierbypt.backend.entity.Appointment;
import pl.atelierbypt.backend.entity.WorkingHours;
import pl.atelierbypt.backend.enums.AppointmentStatus;
import pl.atelierbypt.backend.exception.AvailabilityBadRequestException;
import pl.atelierbypt.backend.repository.AppointmentRepository;
import pl.atelierbypt.backend.repository.AvailabilityExceptionRepository;
import pl.atelierbypt.backend.repository.WorkingHoursRepository;
import pl.atelierbypt.backend.service.availability.DailyAvailabilityCalculator;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminAvailabilityServiceTest {

    private static final ZoneId ZONE = ZoneId.of("Europe/Warsaw");
    private static final Instant FIXED_INSTANT = ZonedDateTime.of(
            2026, 7, 29, 10, 0, 0, 0, ZONE
    ).toInstant();
    private static final LocalDate MONDAY = LocalDate.of(2026, 8, 3);

    @Mock
    private WorkingHoursRepository workingHoursRepository;
    @Mock
    private AvailabilityExceptionRepository availabilityExceptionRepository;
    @Mock
    private AppointmentRepository appointmentRepository;

    private AdminAvailabilityService adminAvailabilityService;

    @BeforeEach
    void setUp() {
        adminAvailabilityService = new AdminAvailabilityService(
                Clock.fixed(FIXED_INSTANT, ZONE),
                workingHoursRepository,
                availabilityExceptionRepository,
                appointmentRepository,
                new DailyAvailabilityCalculator()
        );
    }

    @Test
    void shouldReturnFreeRangesWithScheduledAppointmentRemoved() {
        WorkingHours workingHours = createWorkingMonday();
        Appointment appointment = createAppointment();

        when(workingHoursRepository.findByIsActiveTrue())
                .thenReturn(List.of(workingHours));
        when(availabilityExceptionRepository
                .findByDateBetweenAndIsActiveTrue(MONDAY, MONDAY))
                .thenReturn(List.of());
        when(appointmentRepository.findActiveBetweenDates(MONDAY, MONDAY))
                .thenReturn(List.of(appointment));

        List<AdminAvailabilityDayResponse> result =
                adminAvailabilityService.getAvailability(MONDAY, MONDAY);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().date()).isEqualTo(MONDAY);
        assertThat(result.getFirst().availableRanges())
                .containsExactly(
                        new AvailableTimeRangeResponse(
                                LocalTime.of(8, 0),
                                LocalTime.of(11, 0)
                        ),
                        new AvailableTimeRangeResponse(
                                LocalTime.of(13, 0),
                                LocalTime.of(17, 0)
                        )
                );
    }

    @Test
    void shouldRejectRangeLongerThanThirtyOneDays() {
        LocalDate end = MONDAY.plusDays(31);

        assertThatThrownBy(() ->
                adminAvailabilityService.getAvailability(MONDAY, end))
                .isInstanceOf(AvailabilityBadRequestException.class)
                .hasMessage("Jedno zapytanie może obejmować maksymalnie 31 dni.");
    }

    private WorkingHours createWorkingMonday() {
        WorkingHours workingHours = new WorkingHours();
        workingHours.setDayOfWeek(DayOfWeek.MONDAY);
        workingHours.setStartTime(LocalTime.of(8, 0));
        workingHours.setEndTime(LocalTime.of(17, 0));
        workingHours.setWorkingDay(true);
        return workingHours;
    }

    private Appointment createAppointment() {
        Appointment appointment = new Appointment();
        appointment.setAppointmentDate(MONDAY);
        appointment.setStartTime(LocalTime.of(11, 0));
        appointment.setDurationMinutes(120);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setActive(true);
        return appointment;
    }
}
