package pl.atelierbypt.backend.service;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import pl.atelierbypt.backend.dto.AppointmentRequest;
import pl.atelierbypt.backend.dto.AppointmentResponse;
import pl.atelierbypt.backend.dto.PatchAppointmentStatusRequest;
import pl.atelierbypt.backend.dto.PatchAppointmentStatusResponse;
import pl.atelierbypt.backend.dto.SuggestedOfferItemResponse;
import pl.atelierbypt.backend.entity.*;
import pl.atelierbypt.backend.enums.AppointmentStatus;
import pl.atelierbypt.backend.exception.*;
import pl.atelierbypt.backend.repository.*;
import pl.atelierbypt.backend.service.availability.AvailabilityStatus;
import pl.atelierbypt.backend.service.availability.DailyAvailabilityCalculator;
import pl.atelierbypt.backend.service.availability.TimeRange;

import java.time.*;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;


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
    private final DailyAvailabilityCalculator dailyAvailabilityCalculator;


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

    public List<SuggestedOfferItemResponse> getSuggestedOfferItems(Long clientId) {
        findClientById(clientId);

        return appointmentRepository.findLastBookedServicesByClient(clientId).stream()
                .collect(Collectors.toMap(
                        OfferItem::getId,
                        Function.identity(),
                        (firstOfferItem, duplicateOfferItem) -> firstOfferItem,
                        LinkedHashMap::new
                ))
                .values().stream()
                .limit(3)
                .map(offerItem -> new SuggestedOfferItemResponse(
                        offerItem.getId(),
                        offerItem.getName()
                ))
                .toList();
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

    @Transactional
    public PatchAppointmentStatusResponse changeAppointmentStatus(
            Long id,
            PatchAppointmentStatusRequest request
    ) {
        Appointment appointment = findAppointmentById(id);
        AppointmentStatus requestedStatus = request.appointmentStatus();

        if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new AppointmentBadRequestException(
                    "Nie można zmienić statusu anulowanej wizyty "
                            + "ani wizyty oznaczonej jako nieobecność."
            );
        }

        if (requestedStatus != AppointmentStatus.CANCELLED
                && requestedStatus != AppointmentStatus.NO_SHOW) {
            throw new AppointmentBadRequestException(
                    "Wizytę można jedynie anulować "
                            + "albo oznaczyć jako nieobecność."
            );
        }

        if (hasAppointmentEnded(appointment)
                && requestedStatus == AppointmentStatus.CANCELLED) {
            throw new AppointmentBadRequestException(
                    "Nie można anulować zakończonej wizyty."
            );
        }

        appointment.setStatus(requestedStatus);
        Appointment savedAppointment =
                appointmentRepository.save(appointment);

        log.info(
                "Changed appointment status={}, id={}",
                savedAppointment.getStatus(),
                savedAppointment.getId()
        );

        return new PatchAppointmentStatusResponse(
                savedAppointment.getId(),
                savedAppointment.getStatus()
        );
    }

    private boolean hasAppointmentEnded(Appointment appointment) {
        LocalDateTime appointmentEnd = LocalDateTime.of(
                appointment.getAppointmentDate(),
                appointment.getStartTime()
        ).plusMinutes(appointment.getDurationMinutes());

        return !appointmentEnd.isAfter(
                LocalDateTime.now(applicationClock)
        );
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
        validateAvailability(appointment, null);
    }

    private void validateAppointmentForUpdate(Appointment appointment) {
        validateBasicAppointmentRules(appointment);
        validateAvailability(appointment, appointment.getId());
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

    private void validateAvailability(
            Appointment appointment,
            Long ignoredAppointmentId
    ) {

        LocalDate date = appointment.getAppointmentDate();
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        LocalTime appointmentStartTime = appointment.getStartTime();
        LocalTime appointmentEndTime = appointmentStartTime.plusMinutes(appointment.getDurationMinutes());

        WorkingHours workingHours = workingHoursRepository.findByDayOfWeekAndIsActiveTrue(dayOfWeek)
                .orElseThrow(() -> new WorkingHoursNotFoundException("Nie znaleziono godzin pracy dla danego dnia."));

        List<AvailabilityException> availabilityExceptions = availabilityExceptionRepository
                .findByDateAndIsActiveTrue(date);

        List<Appointment> appointments =
                appointmentRepository.findScheduledActiveByDate(date);

        AvailabilityStatus availabilityStatus =
                dailyAvailabilityCalculator.checkAvailability(
                        new TimeRange(appointmentStartTime, appointmentEndTime),
                        workingHours,
                        availabilityExceptions,
                        appointments,
                        ignoredAppointmentId
                );

        switch (availabilityStatus) {
            case AVAILABLE -> {
            }
            case CLOSED_DAY -> throw new AppointmentBadRequestException(
                    "Nie można utworzyć wizyty w dzień zamknięcia salonu."
            );
            case OUTSIDE_OPENING_HOURS -> throw new AppointmentBadRequestException(
                    "Wizyta nie może zostać umówiona poza czasem dostępności salonu."
            );
            case BLOCKED -> throw new AppointmentBadRequestException(
                    "Wizyta koliduje z blokadą dostępności salonu."
            );
            case APPOINTMENT_CONFLICT -> throw new AppointmentTimeConflictException(
                    "Termin wizyty koliduje z istniejącymi."
            );
        }
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

        boolean hasEnded = hasAppointmentEnded(appointment);

        return new AppointmentResponse(appointment.getId(), appointment.getClient().getId(),
                appointment.getClient().getFirstName(), appointment.getClient().getLastName(),
                appointment.getOfferItem().getId(), appointment.getOfferItem().getName(),
                appointment.getAppointmentDate(),
                appointment.getStartTime(), appointment.getDurationMinutes(), appointment.getPrice(),
                appointment.getStatus(), appointment.getNote(), hasEnded, appointment.isActive());
    }
}
