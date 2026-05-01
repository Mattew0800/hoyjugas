package hoyjugas.Repository;

import hoyjugas.Enum.DayType;
import hoyjugas.Model.SpacePricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SpacePricingRepository extends JpaRepository<SpacePricing, Long> {
    @Query("""
            SELECT sp FROM SpacePricing sp
            WHERE sp.space.id = :spaceId
            AND sp.dayType = :dayType
            AND sp.startTime <= :time
            AND sp.endTime > :time
            """)
    Optional<SpacePricing> findPriceForSlot(
            @Param("spaceId") Long spaceId,
            @Param("dayType") DayType dayType,
            @Param("time") LocalTime time
    );

    List<SpacePricing> findBySpaceId(Long spaceId);

    @Query("""
    SELECT p FROM SpacePricing p
    WHERE p.space.id = :spaceId
    AND p.dayType = :dayType
    AND p.id <> :pricingId
    AND (
        p.startTime < :endTime AND p.endTime > :startTime
    )
""")
    List<SpacePricing> findOverlappingPricingsExcludingId(
            Long spaceId,
            DayType dayType,
            LocalTime startTime,
            LocalTime endTime,
            Long pricingId
    );

    @Query("""
    SELECT p FROM SpacePricing p
    WHERE p.space.id = :spaceId
    AND p.dayType = :dayType
    AND (
        p.startTime < :endTime AND p.endTime > :startTime
    )
""")
    List<SpacePricing> findOverlappingPricings(
            Long spaceId,
            DayType dayType,
            LocalTime startTime,
            LocalTime endTime
    );
}
