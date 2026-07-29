package pl.atelierbypt.backend.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import pl.atelierbypt.backend.dto.WorkingHoursRequest;
import pl.atelierbypt.backend.dto.WorkingHoursResponse;
import pl.atelierbypt.backend.dto.PublicWorkingHoursResponse;
import pl.atelierbypt.backend.entity.WorkingHours;
import pl.atelierbypt.backend.exception.WorkingHoursBadRequestException;
import pl.atelierbypt.backend.exception.WorkingHoursNotFoundException;
import pl.atelierbypt.backend.repository.WorkingHoursRepository;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class WorkingHoursService {

    private final WorkingHoursRepository workingHoursRepository;

    public List<WorkingHoursResponse> getWorkingHours() {
        return workingHoursRepository.findByIsActiveTrue().stream().map(this::mapToWorkingHoursResponse).toList();
    }

    public WorkingHoursResponse getWorkingHoursById(Long id) {
        return mapToWorkingHoursResponse(workingHoursRepository.findByIdAndIsActiveTrue(id).orElseThrow(() ->
                new WorkingHoursNotFoundException("Nie znaleziono dnia id: " + id)));
    }

    public List<PublicWorkingHoursResponse> getPublicWorkingHours() {
        return workingHoursRepository.findByIsActiveTrue().stream()
                .map(this::mapToPublicWorkingHoursResponse)
                .toList();
    }

    public WorkingHoursResponse updateWorkingHours(Long id, WorkingHoursRequest workingHoursRequest) {
        WorkingHours workingHours = workingHoursRepository.findByIdAndIsActiveTrue(id).orElseThrow(() ->
                new WorkingHoursNotFoundException("Nie znaleziono dnia id: " + id));
        validateWorkingHoursRequest(workingHoursRequest);
        mapRequestToWorkingHours(workingHoursRequest, workingHours);
        WorkingHours savedWorkingHours = workingHoursRepository.save(workingHours);
        log.info("Working hours updated for day={}, id={}",
                savedWorkingHours.getDayOfWeek(),
                savedWorkingHours.getId());
        return mapToWorkingHoursResponse(savedWorkingHours);
    }

    private WorkingHoursResponse mapToWorkingHoursResponse(WorkingHours workingHours) {
        return new WorkingHoursResponse(workingHours.getId(), workingHours.getDayOfWeek(), workingHours.getStartTime(),
                workingHours.getEndTime(), workingHours.isWorkingDay(),
                workingHours.getPublicSlotDurationMinutes(), workingHours.isActive());
    }

    private PublicWorkingHoursResponse mapToPublicWorkingHoursResponse(
            WorkingHours workingHours
    ) {
        return new PublicWorkingHoursResponse(
                workingHours.getDayOfWeek(),
                workingHours.getStartTime(),
                workingHours.getEndTime(),
                workingHours.isWorkingDay()
        );
    }

    private void mapRequestToWorkingHours(WorkingHoursRequest request, WorkingHours workingHours) {
        workingHours.setStartTime(request.startTime());
        workingHours.setEndTime(request.endTime());
        workingHours.setWorkingDay(request.isWorkingDay());
        workingHours.setPublicSlotDurationMinutes(
                request.publicSlotDurationMinutes()
        );
    }

    private void validateWorkingHoursRequest(WorkingHoursRequest request) {
        if (request.isWorkingDay()) {
            if (request.startTime() == null || request.endTime() == null) {
                throw new WorkingHoursBadRequestException(
                        "Czas rozpoczęcia i zakończenia jest wymagany przy pracującym dniu");
            }

            if (!request.startTime().isBefore(request.endTime())) {
                throw new WorkingHoursBadRequestException(
                        "Czas rozpoczęcia musi być wcześniejszy niż czas zakończenia");
            }
        } else {
            if (request.startTime() != null || request.endTime() != null) {
                throw new WorkingHoursBadRequestException(
                        "Dzień niepracujący nie może mieć ustawionych godzin pracy");
            }
        }
    }
}
