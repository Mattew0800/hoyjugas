package hoyjugas.Repository;

import hoyjugas.Enum.PaymentStatus;
import hoyjugas.Enum.PaymentType;
import hoyjugas.Model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBookingId(@Param("bookingId") Long bookingId);
    @Query("""
    SELECT COALESCE(SUM(p.amount), 0)
    FROM Payment p
    WHERE p.booking.id = :bookingId
    AND p.status = 'PAGADO'
    AND p.type <> 'DEVOLUCION'
""")
    BigDecimal findTotalCobradoByBookingId(@Param("bookingId") Long bookingId);

    Optional<Payment> findFirstByBookingIdAndStatusOrderByCreatedAtAsc(
            Long bookingId,
            PaymentStatus status
    );

    @Query("""
    SELECT COALESCE(SUM(p.amount), 0)
    FROM Payment p
    WHERE p.booking.id = :bookingId
    AND p.type = :type
    AND p.status = :status
    """)
    BigDecimal findTotalByBookingIdAndType(
            @Param("bookingId") Long bookingId,
            @Param("type") PaymentType type,
            @Param("status") PaymentStatus status
    );

    @Query("""
    SELECT COALESCE(SUM(p.amount), 0)
    FROM Payment p
    WHERE p.booking.id = :bookingId
    AND p.type <> :excludeType
    AND p.status = :status
""")
    BigDecimal findTotalByBookingIdExcludingType(
            @Param("bookingId") Long bookingId,
            @Param("excludeType") PaymentType excludeType,
            @Param("status") PaymentStatus status
    );

    Optional<Payment> findFirstByBookingIdAndTypeOrderByCreatedAtDesc(
            Long bookingId,
            PaymentType type
    );

    Optional<Payment> findByBookingIdAndTypeAndStatus(Long bookingId, PaymentType type, PaymentStatus status);
    @Query("""
        SELECT COALESCE(SUM(p.amount), 0) FROM Payment p
        WHERE p.booking.id = :bookingId
        AND p.type = :type
        AND p.status = :status
        """)
    BigDecimal findTotalByBookingIdAndTypeAndStatus(
            @Param("bookingId") Long bookingId,
            @Param("type") PaymentType type,
            @Param("status") PaymentStatus status
    );
}
