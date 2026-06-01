package hoyjugas.Repository;

import hoyjugas.Enum.BookingStatus;
import hoyjugas.Enum.PaymentType;
import hoyjugas.Model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import hoyjugas.Enum.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
            SELECT COUNT(b) > 0 FROM Booking b
            WHERE b.space.id = :spaceId
            AND b.bookingStatus <> :cancelado
            AND (b.startDatetime < :endDatetime AND b.endDatetime > :startDatetime)
            """)
    boolean existsOverlappingBooking(
            @Param("spaceId") Long spaceId,
            @Param("startDatetime") LocalDateTime startDatetime,
            @Param("endDatetime") LocalDateTime endDatetime,
            @Param("cancelado") BookingStatus cancelado
    );
    @Modifying
    @Query("UPDATE Booking b SET b.bookingNumber = :bookingNumber WHERE b.id = :id")
    void updateBookingNumber(@Param("id") Long id, @Param("bookingNumber") String bookingNumber);

    @Query("""
            SELECT b FROM Booking b
            WHERE b.space.id = :spaceId
            AND b.startDatetime >= :startOfDay
            AND b.startDatetime < :endOfDay
            AND b.bookingStatus <> :cancelado
            ORDER BY b.startDatetime ASC
            """)
    List<Booking> findBySpaceAndDate(
            @Param("spaceId") Long spaceId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay,
            @Param("cancelado") BookingStatus cancelado
    );

    List<Booking> findByClientIdOrderByStartDatetimeDesc(Long clientId);//capaz mas adelante pasar a Page y Pageable

    @Query("""
        SELECT b FROM Booking b
        WHERE b.recurringBooking.id = :recurringId
        AND b.startDatetime > :from
        AND b.bookingStatus <> :cancelado
        ORDER BY b.startDatetime ASC
        """)
    List<Booking> findFutureActiveByRecurringId(
            @Param("recurringId") Long recurringId,
            @Param("from") LocalDateTime from,
            @Param("cancelado") BookingStatus cancelado
    );
    List<Booking> findByRecurringBookingIdOrderByStartDatetimeAsc(Long recurringBookingId);

    @Query("""
        SELECT b.totalAmount - COALESCE(SUM(p.amount), 0)
        FROM Booking b
        LEFT JOIN Payment p ON p.booking.id = b.id
        AND p.status = 'PAGADO'
        AND p.type <> 'DEVOLUCION'
        WHERE b.id = :bookingId
        """)
    BigDecimal findRemainingAmount(@Param("bookingId") Long bookingId);

    @Query("""
        SELECT COALESCE(SUM(b.totalAmount - COALESCE(
            (SELECT SUM(p.amount) FROM Payment p 
             WHERE p.booking.id = b.id 
             AND p.status = :pagado
             AND p.type <> :devolucion), 0)), 0)
        FROM Booking b
        WHERE b.client.id = :clientId
        AND b.paymentStatus = :noPagado
        AND b.bookingStatus = :finalizado
        """)
    BigDecimal findDebtByClientId(
            @Param("clientId") Long clientId,
            @Param("noPagado") PaymentStatus noPagado,
            @Param("finalizado") BookingStatus finalizado,
            @Param("pagado") PaymentStatus pagado,
            @Param("devolucion") PaymentType devolucion
    );

    @Query("""
    SELECT b FROM Booking b
    WHERE (:clientId IS NULL OR b.client.id = :clientId)
    AND (:spaceId IS NULL OR b.space.id = :spaceId)
    AND (:bookingStatus IS NULL OR b.bookingStatus = :bookingStatus)
    AND (:dateFrom IS NULL OR b.startDatetime >= :dateFrom)
    AND (:dateTo IS NULL OR b.startDatetime <= :dateTo)
    AND (:employeeId IS NULL OR EXISTS (
        SELECT p FROM Payment p
        WHERE p.booking.id = b.id
        AND p.collectedBy.id = :employeeId
    ))
    ORDER BY b.startDatetime DESC
    """)
    Page<Booking> findAllWithFilters(
            @Param("clientId") Long clientId,
            @Param("spaceId") Long spaceId,
            @Param("bookingStatus") BookingStatus bookingStatus,
            @Param("employeeId") Long employeeId,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable
    );

}
