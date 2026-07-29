package pl.atelierbypt.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.atelierbypt.backend.dto.AdminAvailabilityDayResponse;
import pl.atelierbypt.backend.dto.AvailableTimeRangeResponse;
import pl.atelierbypt.backend.entity.Appointment;
import pl.atelierbypt.backend.entity.AvailabilityException;
import pl.atelierbypt.backend.entity.WorkingHours;
import pl.atelierbypt.backend.exception.AvailabilityBadRequestException;
import pl.atelierbypt.backend.repository.AppointmentRepository;
import pl.atelierbypt.backend.repository.AvailabilityExceptionRepository;
import pl.atelierbypt.backend.repository.WorkingHoursRepository;
import pl.atelierbypt.backend.service.availability.DailyAvailabilityCalculator;
import pl.atelierbypt.backend.service.availability.TimeRange;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminAvailabilityService {

    private final Clock applicationClock;
    private final WorkingHoursRepository workingHoursRepository;
    private final AvailabilityExceptionRepository availabilityExceptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final DailyAvailabilityCalculator dailyAvailabilityCalculator;

    public List<AdminAvailabilityDayResponse> getAvailability(
            LocalDate start,
            LocalDate end
    ) {
        validateDateRange(start, end);

        Map<DayOfWeek, WorkingHours> workingHoursByDay =
                workingHoursRepository.findByIsActiveTrue().stream()
                        .collect(Collectors.toMap(
                                WorkingHours::getDayOfWeek,
                                workingHours -> workingHours
                        ));

        Map<LocalDate, List<AvailabilityException>> exceptionsByDate =
                availabilityExceptionRepository
                        .findByDateBetweenAndIsActiveTrue(start, end)
                        .stream()
                        .collect(Collectors.groupingBy(
                                AvailabilityException::getDate
                        ));

        Map<LocalDate, List<Appointment>> appointmentsByDate =
                appointmentRepository.findActiveBetweenDates(start, end)
                        .stream()
                        .collect(Collectors.groupingBy(
                                Appointment::getAppointmentDate
                        ));

        LocalDateTime now = LocalDateTime.now(applicationClock);

        return start.datesUntil(end.plusDays(1))
                .map(date -> mapAvailabilityForDay(
                        date,
                        workingHoursByDay.get(date.getDayOfWeek()),
                        exceptionsByDate.getOrDefault(date, List.of()),
                        appointmentsByDate.getOrDefault(date, List.of()),
                        now
                ))
                .toList();
    }

    private AdminAvailabilityDayResponse mapAvailabilityForDay(
            LocalDate date,
            WorkingHours workingHours,
            List<AvailabilityException> exceptions,
            List<Appointment> appointments,
            LocalDateTime now
    ) {
        List<TimeRange> availableRanges = dailyAvailabilityCalculator.calculate(
                workingHours,
                exceptions,
                appointments
        );
        availableRanges = dailyAvailabilityCalculator.removeElapsedTime(
                date,
                availableRanges,
                now
        );

        List<AvailableTimeRangeResponse> responseRanges = availableRanges.stream()
                .map(range -> new AvailableTimeRangeResponse(
                        range.startTime(),
                        range.endTime()
                ))
                .toList();

        return new AdminAvailabilityDayResponse(date, responseRanges);
    }

    private void validateDateRange(LocalDate start, LocalDate end) {
        if (start == null || end == null) {
            throw new AvailabilityBadRequestException(
                    "Data rozpoczęcia i zakończenia jest wymagana."
            );
        }

        if (end.isBefore(start)) {
            throw new AvailabilityBadRequestException(
                    "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia."
            );
        }

        if (end.isAfter(start.plusDays(30))) {
            throw new AvailabilityBadRequestException(
                    "Jedno zapytanie może obejmować maksymalnie 31 dni."
            );
        }
    }
}
