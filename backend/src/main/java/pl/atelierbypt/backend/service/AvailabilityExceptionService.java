package pl.atelierbypt.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import pl.atelierbypt.backend.dto.AvailabilityExceptionRequest;
import pl.atelierbypt.backend.dto.AvailabilityExceptionResponse;
import pl.atelierbypt.backend.entity.AvailabilityException;
import pl.atelierbypt.backend.enums.AvailabilityExceptionType;
import pl.atelierbypt.backend.exception.AvailabilityExceptionBadRequestException;
import pl.atelierbypt.backend.exception.AvailabilityExceptionNotFoundException;
import pl.atelierbypt.backend.repository.AvailabilityExceptionRepository;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AvailabilityExceptionService {

    private final AvailabilityExceptionRepository availabilityExceptionRepository;

    public List<AvailabilityExceptionResponse> getAvailabilityExceptions(
            LocalDate start, LocalDate end) {
        List<AvailabilityException> exceptions = availabilityExceptionRepository
                .findByDateBetweenAndIsActiveTrue(start, end);
        return exceptions.stream().map(this::mapAvailabilityExceptionToResponse).toList();
    }

    public AvailabilityExceptionResponse getAvailabilityExceptionById(Long id) {
        return mapAvailabilityExceptionToResponse(findAvailabilityExceptionById(id));
    }

    public AvailabilityExceptionResponse createAvailabilityException(AvailabilityExceptionRequest request) {
        validateAvailabilityExceptionRequest(request);
        AvailabilityException availabilityException = new AvailabilityException();
        mapRequestToAvailabilityException(request, availabilityException);
        AvailabilityException savedAvailabilityException = availabilityExceptionRepository.save(availabilityException);
        log.info("Created availability exception for date={}, id={}",
                savedAvailabilityException.getDate(), savedAvailabilityException.getId());
        return mapAvailabilityExceptionToResponse(savedAvailabilityException);
    }

    public AvailabilityExceptionResponse updateAvailabilityException(Long id, AvailabilityExceptionRequest request) {
        AvailabilityException availabilityException = findAvailabilityExceptionById(id);
        validateAvailabilityExceptionRequest(request);
        mapRequestToAvailabilityException(request, availabilityException);
        AvailabilityException savedAvailabilityException = availabilityExceptionRepository.save(availabilityException);
        log.info("Updated availability exception date={}, id={}",
                savedAvailabilityException.getDate(), savedAvailabilityException.getId());
        return mapAvailabilityExceptionToResponse(savedAvailabilityException);
    }

    public void archiveAvailabilityException(Long id) {
        AvailabilityException availabilityException = findAvailabilityExceptionById(id);
        availabilityException.setActive(false);
        AvailabilityException savedAvailabilityException = availabilityExceptionRepository.save(availabilityException);
        log.info("Archived availability exception id={}",  savedAvailabilityException.getId());
    }

    private AvailabilityException findAvailabilityExceptionById(Long id) {
        return availabilityExceptionRepository.findByIdAndIsActiveTrue(id).orElseThrow(() ->
                new AvailabilityExceptionNotFoundException("Nie znaleziono wyjątku o id: " + id));
    }

    private void mapRequestToAvailabilityException(AvailabilityExceptionRequest request,
                                                   AvailabilityException availabilityException) {
        availabilityException.setDate(request.date());
        availabilityException.setStartTime(request.startTime());
        availabilityException.setEndTime(request.endTime());
        availabilityException.setType(request.type());
        availabilityException.setNote(request.note());
    }

    private AvailabilityExceptionResponse mapAvailabilityExceptionToResponse(
            AvailabilityException availabilityException) {
        return new AvailabilityExceptionResponse(availabilityException.getId(), availabilityException.getDate(),
                availabilityException.getStartTime(), availabilityException.getEndTime(),
                availabilityException.getType(), availabilityException.getNote(),
                availabilityException.isActive());
    }

    private void validateAvailabilityExceptionRequest(AvailabilityExceptionRequest request) {
        if (request.type() == AvailabilityExceptionType.CLOSED_DAY) {
            if (request.startTime() != null || request.endTime() != null) {
                throw new AvailabilityExceptionBadRequestException(
                        "Dzień zamknięty nie może mieć ustawionych godzin.");
            }
            return;
        }

        if (request.startTime() == null || request.endTime() == null) {
            throw new AvailabilityExceptionBadRequestException(
                    "Czas rozpoczęcia i zakończenia jest wymagany dla tego typu wyjątku.");
        }

        if (!request.startTime().isBefore(request.endTime())) {
            throw new AvailabilityExceptionBadRequestException(
                    "Czas rozpoczęcia musi być wcześniejszy niż czas zakończenia.");
        }
    }
}
