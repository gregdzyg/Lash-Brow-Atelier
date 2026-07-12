package pl.atelierbypt.backend.repository;

import org.springframework.data.repository.Repository;
import pl.atelierbypt.backend.entity.WorkingHours;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

public interface WorkingHoursRepository extends Repository<WorkingHours, Long> {

    WorkingHours save(WorkingHours workingHours);
    Optional<WorkingHours> findByIdAndIsActiveTrue(Long id);
    List<WorkingHours> findByIsActiveTrue();
    Optional<WorkingHours> findByDayOfWeekAndIsActiveTrue(DayOfWeek dayOfWeek);
}
