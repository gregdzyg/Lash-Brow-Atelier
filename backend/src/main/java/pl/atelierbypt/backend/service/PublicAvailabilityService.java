package pl.atelierbypt.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import pl.atelierbypt.backend.dto.PublicAvailabilityDayResponse;
import pl.atelierbypt.backend.entity.Appointment;
import pl.atelierbypt.backend.entity.AvailabilityException;
import pl.atelierbypt.backend.entity.OfferItem;
import pl.atelierbypt.backend.entity.WorkingHours;
import pl.atelierbypt.backend.exception.OfferItemNotFoundException;
import pl.atelierbypt.backend.exception.PublicAvailabilityBadRequestException;
import pl.atelierbypt.backend.repository.AppointmentRepository;
import pl.atelierbypt.backend.repository.AvailabilityExceptionRepository;
import pl.atelierbypt.backend.repository.OfferItemRepository;
import pl.atelierbypt.backend.repository.WorkingHoursRepository;
import pl.atelierbypt.backend.service.availability.DailyAvailabilityCalculator;
import pl.atelierbypt.backend.service.availability.PublicSlotGenerator;
import pl.atelierbypt.backend.service.availability.TimeRange;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
    private final OfferItemRepository offerItemRepository;
    private final DailyAvailabilityCalculator dailyAvailabilityCalculator;
    private final PublicSlotGenerator publicSlotGenerator;

    public List<PublicAvailabilityDayResponse> getAvailability(
            LocalDate start,
            LocalDate end,
            Long offerItemId
    ) {
        validateDateRange(start, end);
        OfferItem offerItem = offerItemRepository
                .findByIdAndIsActiveTrue(offerItemId)
                .orElseThrow(() -> new OfferItemNotFoundException(
                        "Nie znaleziono aktywnej usługi z id "
                                + offerItemId
                ));

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
                        .collect(Collectors.groupingBy(
                                Appointment::getAppointmentDate
                        ));

        return start.datesUntil(end.plusDays(1))
                .map(date -> calculateAvailabilityForDay(
                        date,
                        workingHoursByDay.get(date.getDayOfWeek()),
                        exceptionsByDate.getOrDefault(date, List.of()),
                        appointmentsByDate.getOrDefault(date, List.of()),
                        offerItem.getDurationMinutes()
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
            List<Appointment> appointments,
            int serviceDurationMinutes
    ) {
        List<TimeRange> availableRanges = dailyAvailabilityCalculator.calculate(
                workingHours,
                exceptions,
                appointments
        );
        availableRanges = dailyAvailabilityCalculator.removeElapsedTime(
                date,
                availableRanges,
                LocalDateTime.now(applicationClock)
        );

        List<LocalTime> availableStartTimes =
                publicSlotGenerator.generateStartTimes(
                        workingHours,
                        exceptions,
                        availableRanges,
                        serviceDurationMinutes
                );

        return new PublicAvailabilityDayResponse(
                date,
                availableStartTimes
        );
    }

}
