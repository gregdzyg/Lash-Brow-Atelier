package pl.atelierbypt.backend.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;
import pl.atelierbypt.backend.entity.Appointment;
import pl.atelierbypt.backend.entity.OfferItem;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends Repository<Appointment, Long> {

    Appointment save(Appointment appointment);
    Optional<Appointment> findByIdAndIsActiveTrue(Long id);

    @Query("""
    SELECT a
    FROM Appointment a
    WHERE a.isActive = true
      AND a.appointmentDate BETWEEN :start AND :end
    ORDER BY a.appointmentDate ASC, a.startTime ASC
    """)
    List<Appointment> findActiveBetweenDates(@Param("start") LocalDate start,
                                             @Param("end") LocalDate end);

    @Query("""
    SELECT a
    FROM Appointment a
    WHERE a.isActive = true
        AND a.status = 'SCHEDULED'
        AND a.appointmentDate = :date
    ORDER BY a.startTime ASC
    """)
    List<Appointment> findScheduledActiveByDate(@Param("date") LocalDate date);

    @Query("""
    SELECT a
    FROM Appointment a
    WHERE a.client.id = :clientId
      AND a.isActive = true
    ORDER BY a.appointmentDate DESC, a.startTime DESC
    """)
    List<Appointment> findActiveByClientId(@Param("clientId") Long clientId);

    @Query("""
    SELECT o
    FROM Appointment a
    JOIN a.offerItem o
    WHERE a.client.id = :clientId
        AND a.isActive = true
        AND a.status = 'SCHEDULED'
    ORDER BY a.appointmentDate DESC, a.startTime DESC
    """)
    List<OfferItem> findLastBookedServicesByClient(@Param("clientId") Long clientId);
}
