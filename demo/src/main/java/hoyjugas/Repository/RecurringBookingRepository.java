package hoyjugas.Repository;

import hoyjugas.Enum.RecurringStatus;
import hoyjugas.Model.RecurringBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.DayOfWeek;
import java.time.LocalTime;
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

    List<RecurringBooking> findByClientIdAndStatus(Long clientId, RecurringStatus status);

}

