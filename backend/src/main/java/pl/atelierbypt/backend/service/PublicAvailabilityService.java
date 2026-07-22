package pl.atelierbypt.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
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

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PublicAvailabilityService {

    private final Clock applicationClock;
    private final WorkingHoursRepository workingHoursRepository;
    private final AvailabilityExceptionRepository availabilityExceptionRepository;
    private final AppointmentRepository appointmentRepository;

    public List<PublicAvailabilityDayResponse> getAvailability(
            LocalDate start,
            LocalDate end
    ) {
        validateDateRange(start, end);

        List<WorkingHours> workingHours =
                workingHoursRepository.findByIsActiveTrue();

        List<AvailabilityException> availabilityExceptions =
                availabilityExceptionRepository
                        .findByDateBetweenAndIsActiveTrue(start, end);

        List<Appointment> appointments =
                appointmentRepository.findActiveBetweenDates(start, end);

        Map<DayOfWeek, WorkingHours> workingHoursByDay =
                workingHours.stream()
                        .collect(Collectors.toMap(
                                WorkingHours::getDayOfWeek,
                                workingHoursEntry -> workingHoursEntry
                        ));

        Map<LocalDate, List<AvailabilityException>> exceptionsByDate =
                availabilityExceptions.stream()
                        .collect(Collectors.groupingBy(
                                AvailabilityException::getDate
                        ));

        Map<LocalDate, List<Appointment>> appointmentsByDate =
                appointments.stream()
                        .filter(appointment ->
                                appointment.getStatus() == AppointmentStatus.SCHEDULED)
                        .collect(Collectors.groupingBy(
                                Appointment::getAppointmentDate
                        ));

        return start.datesUntil(end.plusDays(1))
                .map(date -> calculateAvailabilityForDay(
                        date,
                        workingHoursByDay.get(date.getDayOfWeek()),
                        exceptionsByDate.getOrDefault(date, List.of()),
                        appointmentsByDate.getOrDefault(date, List.of())
                ))
                .toList();
    }

    private void validateDateRange(LocalDate start, LocalDate end) {
        if (start == null || end == null) {
            throw new PublicAvailabilityBadRequestException(
                    "Data rozpoczęcia i zakończenia jest wymagana."
            );
        }

        LocalDate today = LocalDate.now(applicationClock);
        LocalDate maximumDate = today.plusMonths(3);

        if (end.isBefore(start)) {
            throw new PublicAvailabilityBadRequestException(
                    "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia."
            );
        }

        if (start.isBefore(today)) {
            throw new PublicAvailabilityBadRequestException(
                    "Nie można pobrać dostępności dla minionych dat."
            );
        }

        if (end.isAfter(maximumDate)) {
            throw new PublicAvailabilityBadRequestException(
                    "Dostępność można sprawdzić maksymalnie na trzy miesiące do przodu."
            );
        }

        if (end.isAfter(start.plusDays(30))) {
            throw new PublicAvailabilityBadRequestException(
                    "Jedno zapytanie może obejmować maksymalnie 31 dni."
            );
        }
    }

    private PublicAvailabilityDayResponse calculateAvailabilityForDay(
            LocalDate date,
            WorkingHours workingHours,
            List<AvailabilityException> exceptions,
            List<Appointment> appointments
    ) {
        boolean isClosedDay = exceptions.stream()
                .anyMatch(exception ->
                        exception.getType() == AvailabilityExceptionType.CLOSED_DAY);

        if (isClosedDay) {
            return new PublicAvailabilityDayResponse(date, List.of());
        }

        List<TimeRange> availableRanges = new ArrayList<>();

        if (workingHours != null && workingHours.isWorkingDay()) {
            availableRanges.add(new TimeRange(
                    workingHours.getStartTime(),
                    workingHours.getEndTime()
            ));
        }

        exceptions.stream()
                .filter(exception ->
                        exception.getType() == AvailabilityExceptionType.EXTRA_OPEN)
                .map(exception -> new TimeRange(
                        exception.getStartTime(),
                        exception.getEndTime()
                ))
                .forEach(availableRanges::add);

        availableRanges = mergeRanges(availableRanges);

        List<TimeRange> blockedRanges = exceptions.stream()
                .filter(exception ->
                        exception.getType() == AvailabilityExceptionType.BLOCKED)
                .map(exception -> new TimeRange(
                        exception.getStartTime(),
                        exception.getEndTime()
                ))
                .toList();

        availableRanges = subtractRanges(availableRanges, blockedRanges);

        List<TimeRange> appointmentRanges = appointments.stream()
                .map(appointment -> new TimeRange(
                        appointment.getStartTime(),
                        appointment.getStartTime()
                                .plusMinutes(appointment.getDurationMinutes())
                ))
                .toList();

        availableRanges = subtractRanges(availableRanges, appointmentRanges);
        availableRanges = removeElapsedTime(date, availableRanges);

        List<AvailableTimeRangeResponse> responseRanges = availableRanges.stream()
                .map(range -> new AvailableTimeRangeResponse(
                        range.startTime(),
                        range.endTime()
                ))
                .toList();

        return new PublicAvailabilityDayResponse(date, responseRanges);
    }

    private List<TimeRange> mergeRanges(List<TimeRange> ranges) {
        if (ranges.isEmpty()) {
            return List.of();
        }

        List<TimeRange> sortedRanges = ranges.stream()
                .sorted(Comparator.comparing(TimeRange::startTime))
                .toList();

        List<TimeRange> mergedRanges = new ArrayList<>();
        TimeRange currentRange = sortedRanges.getFirst();

        for (int index = 1; index < sortedRanges.size(); index++) {
            TimeRange nextRange = sortedRanges.get(index);

            if (!nextRange.startTime().isAfter(currentRange.endTime())) {
                LocalTime laterEndTime = nextRange.endTime()
                        .isAfter(currentRange.endTime())
                        ? nextRange.endTime()
                        : currentRange.endTime();

                currentRange = new TimeRange(
                        currentRange.startTime(),
                        laterEndTime
                );
            } else {
                mergedRanges.add(currentRange);
                currentRange = nextRange;
            }
        }

        mergedRanges.add(currentRange);
        return mergedRanges;
    }

    private List<TimeRange> subtractRanges(
            List<TimeRange> availableRanges,
            List<TimeRange> unavailableRanges
    ) {
        List<TimeRange> result = new ArrayList<>(availableRanges);

        for (TimeRange unavailableRange : unavailableRanges) {
            result = result.stream()
                    .flatMap(availableRange ->
                            subtractRange(availableRange, unavailableRange).stream())
                    .toList();
        }

        return result;
    }

    private List<TimeRange> subtractRange(
            TimeRange availableRange,
            TimeRange unavailableRange
    ) {
        if (!availableRange.overlaps(unavailableRange)) {
            return List.of(availableRange);
        }

        List<TimeRange> remainingRanges = new ArrayList<>();

        if (unavailableRange.startTime().isAfter(availableRange.startTime())) {
            remainingRanges.add(new TimeRange(
                    availableRange.startTime(),
                    unavailableRange.startTime()
            ));
        }

        if (unavailableRange.endTime().isBefore(availableRange.endTime())) {
            remainingRanges.add(new TimeRange(
                    unavailableRange.endTime(),
                    availableRange.endTime()
            ));
        }

        return remainingRanges;
    }

    private List<TimeRange> removeElapsedTime(
            LocalDate date,
            List<TimeRange> availableRanges
    ) {
        LocalDateTime now = LocalDateTime.now(applicationClock);

        if (!date.equals(now.toLocalDate())) {
            return availableRanges;
        }

        LocalDateTime nextAvailableMinute = now.withSecond(0).withNano(0);

        if (now.isAfter(nextAvailableMinute)) {
            nextAvailableMinute = nextAvailableMinute.plusMinutes(1);
        }

        if (!nextAvailableMinute.toLocalDate().equals(date)) {
            return List.of();
        }

        LocalTime currentTime = nextAvailableMinute.toLocalTime();

        return availableRanges.stream()
                .filter(range -> range.endTime().isAfter(currentTime))
                .map(range -> range.startTime().isBefore(currentTime)
                        ? new TimeRange(currentTime, range.endTime())
                        : range)
                .toList();
    }

    private record TimeRange(LocalTime startTime, LocalTime endTime) {

        private TimeRange {
            if (startTime == null || endTime == null || !startTime.isBefore(endTime)) {
                throw new IllegalArgumentException("Nieprawidłowy przedział czasu.");
            }
        }

        private boolean overlaps(TimeRange other) {
            return startTime.isBefore(other.endTime())
                    && endTime.isAfter(other.startTime());
        }
    }

}
