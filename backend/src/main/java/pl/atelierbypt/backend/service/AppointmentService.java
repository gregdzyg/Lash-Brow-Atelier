package pl.atelierbypt.backend.service;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import pl.atelierbypt.backend.dto.AppointmentRequest;
import pl.atelierbypt.backend.dto.AppointmentResponse;
import pl.atelierbypt.backend.dto.PatchAppointmentStatusRequest;
import pl.atelierbypt.backend.dto.PatchAppointmentStatusResponse;
import pl.atelierbypt.backend.entity.*;
import pl.atelierbypt.backend.enums.AppointmentStatus;
import pl.atelierbypt.backend.enums.AvailabilityExceptionType;
import pl.atelierbypt.backend.exception.*;
import pl.atelierbypt.backend.repository.*;

import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;


@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AvailabilityExceptionRepository availabilityExceptionRepository;
    private final WorkingHoursRepository workingHoursRepository;
    private final OfferItemRepository offerItemRepository;
    private final ClientRepository clientRepository;
    private final AppointmentRepository appointmentRepository;
    private final Clock applicationClock;


    public List<AppointmentResponse> getAppointments(LocalDate start,  LocalDate end) {
        if (end.isBefore(start)) {
            throw new AppointmentBadRequestException("Data zakończenia nie może być przed datą rozpoczęcia.");
        }
        return appointmentRepository.findActiveBetweenDates(start, end).stream()
                .map(this::mapAppointmentToResponse).toList();
    }

    public AppointmentResponse getAppointmentById(Long id) {
        return mapAppointmentToResponse(findAppointmentById(id));
    }

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest appointmentRequest) {

        Client client = findClientById(appointmentRequest.clientId());
        OfferItem offerItem = findOfferItemById(appointmentRequest.offerItemId());

        Appointment appointment = new Appointment();
        mapRequestToAppointment(appointmentRequest, appointment,  client, offerItem);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setActive(true);
        validateAppointmentForCreate(appointment);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        log.info(
                "Created appointment id={}, date={}, startTime={}",
                savedAppointment.getId(),
                savedAppointment.getAppointmentDate(),
                savedAppointment.getStartTime()
        );

        return mapAppointmentToResponse(savedAppointment);
    }

    @Transactional
    public AppointmentResponse updateAppointment(Long id, AppointmentRequest appointmentRequest) {

        Appointment appointment = findAppointmentById(id);

        Client client = findClientById(appointmentRequest.clientId());
        OfferItem offerItem = findOfferItemById(appointmentRequest.offerItemId());

        mapRequestToAppointment(appointmentRequest, appointment, client, offerItem);
        validateAppointmentForUpdate(appointment);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        log.info("Updated appointment id={}, date={}, startTime={}",
                updatedAppointment.getId(), updatedAppointment.getAppointmentDate(), updatedAppointment.getStartTime());
        return mapAppointmentToResponse(updatedAppointment);
    }

    public PatchAppointmentStatusResponse changeAppointmentStatus(Long id, PatchAppointmentStatusRequest request) {
        Appointment appointment = findAppointmentById(id);
        appointment.setStatus(request.appointmentStatus());
        appointmentRepository.save(appointment);
        log.info("Changed appointment status={}, id={}", appointment.getStatus(), appointment.getId());
        return new  PatchAppointmentStatusResponse(appointment.getId(), appointment.getStatus());
    }

    public void archiveAppointment(Long id) {
        Appointment appointment = findAppointmentById(id);
        appointment.setActive(false);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        log.info("Archived appointment id={}", savedAppointment.getId());
    }

    private OfferItem findOfferItemById(Long id) {
        return offerItemRepository
                .findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new OfferItemNotFoundException(
                        "Nie znaleziono oferty z id " + id
                ));
    }

    private Client findClientById(Long id) {
        return clientRepository.findByIdAndIsActiveTrue(id).orElseThrow(() ->
                new ClientNotFoundException("Nie znaleziono klienta z id " + id));
    }

    private Appointment findAppointmentById(Long id) {
        return appointmentRepository.findByIdAndIsActiveTrue(id).orElseThrow(() ->
                new AppointmentNotFoundException("Nie znaleziono wizyty z id " + id));
    }

    private void validateAppointmentForCreate(Appointment  appointment) {
        validateBasicAppointmentRules(appointment);
        validateAvailability(appointment);
        validateCollision(appointment);
    }

    private void validateAppointmentForUpdate(Appointment appointment) {
        validateBasicAppointmentRules(appointment);
        validateAvailability(appointment);
        validateCollision(appointment, appointment.getId());
    }

    private void validateCollision(Appointment appointment) {
        validateCollision(appointment, null);
    }

    private void validateCollision(Appointment appointment, Long ignoredAppointmentId) {

        List<Appointment> appointments = appointmentRepository.findScheduledActiveByDate(appointment.getAppointmentDate());
        TimeRange timeRange = new TimeRange(appointment.getStartTime(), appointment.getStartTime().plusMinutes(
                appointment.getDurationMinutes()
        ));
        boolean collision = appointments.stream()
                .filter(existingAppointment -> !Objects.equals(existingAppointment.getId(),
                        ignoredAppointmentId))
                .map(a -> new TimeRange(
                        a.getStartTime(), a.getStartTime().plusMinutes(a.getDurationMinutes())))
                .anyMatch(r -> r.overlaps(timeRange));
        if (collision) throw new AppointmentTimeConflictException("Termin wizyty koliduje z istniejącymi.");
    }

    private void validateBasicAppointmentRules(Appointment appointment) {

        LocalDateTime now = LocalDateTime.now(applicationClock);

        LocalDateTime appointmentStart = LocalDateTime.of(appointment.getAppointmentDate(), appointment.getStartTime());
        LocalDateTime appointmentEnd = appointmentStart.plusMinutes(appointment.getDurationMinutes());

        if(appointmentStart.isBefore(now)) {
            throw new AppointmentBadRequestException("Nie można utworzyć wizyty w przeszłości.");
        }
        if(!appointmentEnd.toLocalDate().equals(appointmentStart.toLocalDate())) {
            throw new AppointmentBadRequestException("Nie można umówić wizyty, która kończy się następnego dnia.");
        }
    }

    private void validateAvailability(Appointment appointment) {

        LocalDate date = appointment.getAppointmentDate();
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        LocalTime appointmentStartTime = appointment.getStartTime();
        LocalTime appointmentEndTime = appointmentStartTime.plusMinutes(appointment.getDurationMinutes());

        WorkingHours workingHours = workingHoursRepository.findByDayOfWeekAndIsActiveTrue(dayOfWeek)
                .orElseThrow(() -> new WorkingHoursNotFoundException("Nie znaleziono godzin pracy dla danego dnia."));

        List<AvailabilityException> availabilityExceptions = availabilityExceptionRepository
                .findByDateAndIsActiveTrue(date);

        boolean isClosedDay = availabilityExceptions.stream()
                .anyMatch(e -> e.getType() == AvailabilityExceptionType.CLOSED_DAY);

        if(isClosedDay) throw new AppointmentBadRequestException("Nie można utworzyć wizyty w dzień zamknięcia salonu.");

        List<TimeRange> availableRanges = new ArrayList<>();

        if(workingHours.isWorkingDay()) availableRanges.add(new TimeRange(workingHours.getStartTime(), workingHours.getEndTime()));
        availabilityExceptions.stream().filter(e -> e.getType() == AvailabilityExceptionType.EXTRA_OPEN)
                .forEach(a -> availableRanges.add(new TimeRange(a.getStartTime(), a.getEndTime())));

        TimeRange appointmentTimeRange = new TimeRange(appointmentStartTime, appointmentEndTime);
        boolean isAvailable = availableRanges.stream().anyMatch(timeRange ->  timeRange.contains(appointmentTimeRange));

        if(!isAvailable) throw new AppointmentBadRequestException("Wizyta nie może zostać umówiona poza czasem dostępności salonu.");

        boolean isBlocked = availabilityExceptions.stream()
                .filter(e -> e.getType() == AvailabilityExceptionType.BLOCKED)
                .map(e -> new TimeRange(e.getStartTime(), e.getEndTime()))
                .anyMatch(blockedRange -> blockedRange.overlaps(appointmentTimeRange));

        if(isBlocked) throw new AppointmentBadRequestException("Wizyta koliduje z blokadą dostępności salonu.");

    }

    private void mapRequestToAppointment(AppointmentRequest appointmentRequest, Appointment appointment,
                                         Client client, OfferItem offerItem) {
        appointment.setClient(client);
        appointment.setOfferItem(offerItem);
        appointment.setAppointmentDate(appointmentRequest.appointmentDate());
        appointment.setStartTime(appointmentRequest.startTime());
        appointment.setDurationMinutes(
                appointmentRequest.durationMinutes() != null ? appointmentRequest.durationMinutes()
                : offerItem.getDurationMinutes());
        appointment.setPrice(appointmentRequest.price() != null ? appointmentRequest.price()
                : offerItem.getBasePrice());
        appointment.setNote(appointmentRequest.note());
    }

    private AppointmentResponse mapAppointmentToResponse(Appointment appointment) {
        LocalDateTime appointmentEnd = LocalDateTime.of(
                appointment.getAppointmentDate(),
                appointment.getStartTime()
        ).plusMinutes(appointment.getDurationMinutes());
        boolean hasEnded = !appointmentEnd.isAfter(LocalDateTime.now(applicationClock));

        return new AppointmentResponse(appointment.getId(), appointment.getClient().getId(),
                appointment.getClient().getFirstName(), appointment.getClient().getLastName(),
                appointment.getOfferItem().getId(), appointment.getOfferItem().getName(),
                appointment.getAppointmentDate(),
                appointment.getStartTime(), appointment.getDurationMinutes(), appointment.getPrice(),
                appointment.getStatus(), appointment.getNote(), hasEnded, appointment.isActive());
    }

    private record TimeRange(LocalTime start, LocalTime end) {

        boolean contains(TimeRange other) {
            return !other.start().isBefore(start) && !other.end().isAfter(end);
        }

        boolean overlaps(TimeRange other) {
            return start.isBefore(other.end())
                    && end.isAfter(other.start());
        }
    }
}
