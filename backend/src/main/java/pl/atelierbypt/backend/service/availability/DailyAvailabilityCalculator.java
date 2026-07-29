package pl.atelierbypt.backend.service.availability;

import org.springframework.stereotype.Component;
import pl.atelierbypt.backend.entity.Appointment;
import pl.atelierbypt.backend.entity.AvailabilityException;
import pl.atelierbypt.backend.entity.WorkingHours;
import pl.atelierbypt.backend.enums.AppointmentStatus;
import pl.atelierbypt.backend.enums.AvailabilityExceptionType;

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
        boolean isClosedDay = exceptions.stream()
                .anyMatch(exception ->
                        exception.getType() == AvailabilityExceptionType.CLOSED_DAY);

        if (isClosedDay) {
            return List.of();
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

        return subtractRanges(availableRanges, appointmentRanges);
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
