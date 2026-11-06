package hoyjugas.Repository;

import hoyjugas.Enum.MovementType;
import hoyjugas.Model.InventoryMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
    List<InventoryMovement> findByInventoryItemIdOrderByCreatedAtDesc(Long itemId);
    List<InventoryMovement> findByInventoryItemIdOrderByCreatedAtAsc(Long itemId);
    @Query("""
        SELECT m FROM InventoryMovement m
        WHERE (:itemId IS NULL OR m.inventoryItem.id = :itemId)
        AND (:type IS NULL OR m.type = :type)
        AND (:dateFrom IS NULL OR m.createdAt >= :dateFrom)
        AND (:dateTo IS NULL OR m.createdAt <= :dateTo)
        ORDER BY m.createdAt ASC
        """)
    Page<InventoryMovement> findAllWithFilters(
            @Param("itemId") Long itemId,
            @Param("type") MovementType type,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable
    );
}