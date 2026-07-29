package pl.atelierbypt.backend.service.availability;

import org.springframework.stereotype.Component;
import pl.atelierbypt.backend.entity.Appointment;
import pl.atelierbypt.backend.entity.AvailabilityException;
import pl.atelierbypt.backend.entity.WorkingHours;
import pl.atelierbypt.backend.enums.AppointmentStatus;
import pl.atelierbypt.backend.enums.AvailabilityExceptionType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Component
public class DailyAvailabilityCalculator {

    public List<TimeRange> calculate(
            WorkingHours workingHours,
            List<AvailabilityException> exceptions,
            List<Appointment> appointments
    ) {
        return calculate(workingHours, exceptions, appointments, null);
    }

    public List<TimeRange> calculate(
            WorkingHours workingHours,
            List<AvailabilityException> exceptions,
            List<Appointment> appointments,
            Long ignoredAppointmentId
    ) {
        if (isClosedDay(exceptions)) {
            return List.of();
        }

        List<TimeRange> availableRanges = createOpeningRanges(workingHours, exceptions);
        availableRanges = subtractRanges(availableRanges, createBlockedRanges(exceptions));

        return subtractRanges(
                availableRanges,
                createAppointmentRanges(appointments, ignoredAppointmentId)
        );
    }

    public AvailabilityStatus checkAvailability(
            TimeRange requestedRange,
            WorkingHours workingHours,
            List<AvailabilityException> exceptions,
            List<Appointment> appointments,
            Long ignoredAppointmentId
    ) {
        if (isClosedDay(exceptions)) {
            return AvailabilityStatus.CLOSED_DAY;
        }

        List<TimeRange> openingRanges = createOpeningRanges(workingHours, exceptions);
        if (!isContainedInAnyRange(requestedRange, openingRanges)) {
            return AvailabilityStatus.OUTSIDE_OPENING_HOURS;
        }

        List<TimeRange> rangesWithoutBlocks =
                subtractRanges(openingRanges, createBlockedRanges(exceptions));
        if (!isContainedInAnyRange(requestedRange, rangesWithoutBlocks)) {
            return AvailabilityStatus.BLOCKED;
        }

        List<TimeRange> availableRanges = subtractRanges(
                rangesWithoutBlocks,
                createAppointmentRanges(appointments, ignoredAppointmentId)
        );
        if (!isContainedInAnyRange(requestedRange, availableRanges)) {
            return AvailabilityStatus.APPOINTMENT_CONFLICT;
        }

        return AvailabilityStatus.AVAILABLE;
    }

    public List<TimeRange> removeElapsedTime(
            LocalDate date,
            List<TimeRange> availableRanges,
            LocalDateTime now
    ) {
        if (date.isBefore(now.toLocalDate())) {
            return List.of();
        }

        if (date.isAfter(now.toLocalDate())) {
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

    private boolean isClosedDay(List<AvailabilityException> exceptions) {
        return exceptions.stream()
                .anyMatch(exception ->
                        exception.getType() == AvailabilityExceptionType.CLOSED_DAY);
    }

    private List<TimeRange> createOpeningRanges(
            WorkingHours workingHours,
            List<AvailabilityException> exceptions
    ) {
        List<TimeRange> openingRanges = new ArrayList<>();

        if (workingHours != null && workingHours.isWorkingDay()) {
            openingRanges.add(new TimeRange(
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
                .forEach(openingRanges::add);

        return mergeRanges(openingRanges);
    }

    private List<TimeRange> createBlockedRanges(
            List<AvailabilityException> exceptions
    ) {
        return exceptions.stream()
                .filter(exception ->
                        exception.getType() == AvailabilityExceptionType.BLOCKED)
                .map(exception -> new TimeRange(
                        exception.getStartTime(),
                        exception.getEndTime()
                ))
                .toList();
    }

    private List<TimeRange> createAppointmentRanges(
            List<Appointment> appointments,
            Long ignoredAppointmentId
    ) {
        return appointments.stream()
                .filter(appointment ->
                        appointment.getStatus() == AppointmentStatus.SCHEDULED)
                .filter(appointment ->
                        ignoredAppointmentId == null
                                || !Objects.equals(appointment.getId(), ignoredAppointmentId))
                .map(appointment -> new TimeRange(
                        appointment.getStartTime(),
                        appointment.getStartTime()
                                .plusMinutes(appointment.getDurationMinutes())
                ))
                .toList();
    }

    private boolean isContainedInAnyRange(
            TimeRange requestedRange,
            List<TimeRange> ranges
    ) {
        return ranges.stream()
                .anyMatch(range -> range.contains(requestedRange));
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
}
