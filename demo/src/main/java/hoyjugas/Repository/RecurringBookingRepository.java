package hoyjugas.Repository;

import hoyjugas.Enum.DayType;
import hoyjugas.Enum.RecurringStatus;
import hoyjugas.Model.RecurringBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import java.util.List;

public interface RecurringBookingRepository extends JpaRepository<RecurringBooking, Long> {
    List<RecurringBooking> findByClientIdOrderByStartDateDesc(Long clientId);
    @Query("""
            SELECT r FROM RecurringBooking r
            WHERE r.space.id = :spaceId
            AND r.status = :status
            AND r.dayOfWeek = :dayOfWeek
            AND r.startTime = :startTime
            """)
    List<RecurringBooking> findActiveBySpaceAndSlot(
            @Param("spaceId") Long spaceId,
            @Param("status") RecurringStatus status,
            @Param("dayOfWeek") DayOfWeek dayOfWeek,
            @Param("startTime") LocalTime startTime
    );

    @Query("""
        SELECT r FROM RecurringBooking r
        WHERE (:clientId IS NULL OR r.client.id = :clientId)
        AND (:spaceId IS NULL OR r.space.id = :spaceId)
        AND (:status IS NULL OR r.status = :status)
        AND (:dayOfWeek IS NULL OR r.dayOfWeek = :dayOfWeek)
        AND (:cancelledByEmployeeId IS NULL OR r.cancelledBy.id = :cancelledByEmployeeId)
        AND (:startDateFrom IS NULL OR r.startDate >= :startDateFrom)
        AND (:startDateTo IS NULL OR r.startDate <= :startDateTo)
        ORDER BY r.startDate DESC
        """)
    Page<RecurringBooking> findAllWithFilters(
            @Param("clientId") Long clientId,
            @Param("spaceId") Long spaceId,
            @Param("status") RecurringStatus status,
            @Param("dayOfWeek") DayType dayOfWeek,
            @Param("cancelledByEmployeeId") Long cancelledByEmployeeId,
            @Param("startDateFrom") LocalDate startDateFrom,
            @Param("startDateTo") LocalDate startDateTo,
            Pageable pageable
    );

    List<RecurringBooking> findByClientIdAndStatus(Long clientId, RecurringStatus status);

    @Query("""
        SELECT COUNT(r) > 0 FROM RecurringBooking r
        WHERE r.client.id = :clientId
        AND r.space.id = :spaceId
        AND r.dayOfWeek = :dayOfWeek
        AND r.startTime = :startTime
        AND r.status = :status
        """)
    boolean existsActiveRecurring(
            @Param("clientId") Long clientId,
            @Param("spaceId") Long spaceId,
            @Param("dayOfWeek") DayType dayOfWeek,
            @Param("startTime") LocalTime startTime,
            @Param("status") RecurringStatus status
    );
}

