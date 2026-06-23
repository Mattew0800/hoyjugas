package hoyjugas.Repository;

import hoyjugas.Enum.MovementType;
import hoyjugas.Model.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    @Query("""
            SELECT m FROM StockMovement m
            WHERE (:productId IS NULL OR m.product.id = :productId)
            AND (:type IS NULL OR m.type = :type)
            AND (:dateFrom IS NULL OR m.createdAt >= :dateFrom)
            AND (:dateTo IS NULL OR m.createdAt <= :dateTo)
            ORDER BY m.createdAt DESC
            """)
    Page<StockMovement> findAllWithFilters(
            @Param("productId") Long productId,
            @Param("type") MovementType type,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable
    );
}