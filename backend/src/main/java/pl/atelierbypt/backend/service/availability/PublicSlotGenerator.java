package pl.atelierbypt.backend.service.availability;

import org.springframework.stereotype.Component;
import pl.atelierbypt.backend.entity.WorkingHours;

import java.time.Duration;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class PublicSlotGenerator {

    public List<LocalTime> generateStartTimes(
            WorkingHours workingHours,
            List<TimeRange> candidateRanges,
            List<TimeRange> availableRanges,
            int serviceDurationMinutes
    ) {
        if (workingHours == null) {
            return List.of();
        }

        int startIntervalMinutes =
                workingHours.getPublicStartIntervalMinutes();

        return candidateRanges.stream()
                .flatMap(candidateRange ->
                        generateStartTimesForRange(
                                candidateRange,
                                startIntervalMinutes,
                                serviceDurationMinutes
                        ).stream())
                .filter(startTime -> {
                    TimeRange slot = new TimeRange(
                            startTime,
                            startTime.plusMinutes(serviceDurationMinutes)
                    );
                    return availableRanges.stream()
                            .anyMatch(range -> range.contains(slot));
                })
                .distinct()
                .sorted()
                .toList();
    }

    private List<LocalTime> generateStartTimesForRange(
            TimeRange range,
            int startIntervalMinutes,
            int serviceDurationMinutes
    ) {
        List<LocalTime> startTimes = new ArrayList<>();
        LocalTime candidateStart = range.startTime();

        while (Duration.between(candidateStart, range.endTime())
                .toMinutes() >= serviceDurationMinutes) {
            startTimes.add(candidateStart);
            candidateStart = candidateStart.plusMinutes(startIntervalMinutes);
        }

        return startTimes;
    }
}
