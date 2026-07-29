package pl.atelierbypt.backend.service.availability;

import org.springframework.stereotype.Component;
import pl.atelierbypt.backend.entity.AvailabilityException;
import pl.atelierbypt.backend.entity.WorkingHours;
import pl.atelierbypt.backend.enums.AvailabilityExceptionType;

import java.time.Duration;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class PublicSlotGenerator {

    public List<LocalTime> generateStartTimes(
            WorkingHours workingHours,
            List<AvailabilityException> exceptions,
            List<TimeRange> availableRanges
    ) {
        if (workingHours == null) {
            return List.of();
        }

        int slotDurationMinutes =
                workingHours.getPublicSlotDurationMinutes();
        List<TimeRange> slotTemplates = createSlotTemplates(
                workingHours,
                exceptions
        );

        return slotTemplates.stream()
                .flatMap(template ->
                        generateStartTimesForTemplate(
                                template,
                                slotDurationMinutes
                        ).stream())
                .filter(startTime -> {
                    TimeRange slot = new TimeRange(
                            startTime,
                            startTime.plusMinutes(slotDurationMinutes)
                    );
                    return availableRanges.stream()
                            .anyMatch(range -> range.contains(slot));
                })
                .distinct()
                .sorted()
                .toList();
    }

    private List<TimeRange> createSlotTemplates(
            WorkingHours workingHours,
            List<AvailabilityException> exceptions
    ) {
        boolean isClosedDay = exceptions.stream()
                .anyMatch(exception ->
                        exception.getType() == AvailabilityExceptionType.CLOSED_DAY);

        if (isClosedDay) {
            return List.of();
        }

        List<TimeRange> templates = new ArrayList<>();

        if (workingHours.isWorkingDay()) {
            templates.add(new TimeRange(
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
                .forEach(templates::add);

        return templates;
    }

    private List<LocalTime> generateStartTimesForTemplate(
            TimeRange template,
            int slotDurationMinutes
    ) {
        List<LocalTime> startTimes = new ArrayList<>();
        LocalTime candidateStart = template.startTime();

        while (Duration.between(candidateStart, template.endTime())
                .toMinutes() >= slotDurationMinutes) {
            startTimes.add(candidateStart);
            candidateStart = candidateStart.plusMinutes(slotDurationMinutes);
        }

        return startTimes;
    }
}
