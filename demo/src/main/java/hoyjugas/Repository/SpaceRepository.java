package hoyjugas.Repository;

import hoyjugas.Enum.SpaceType;
import hoyjugas.Model.Space;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SpaceRepository extends JpaRepository<Space, Integer> {
    List<Space> findByIsActiveTrue();
    List<Space> findByTypeAndIsActiveTrue(SpaceType type);
    Optional<Space> findByIdAndIsActiveTrue(Long id);
    List<Space> findAllByIsActiveTrue();
    List<Space> findByIsActiveTrueOrderByNameAsc();
    @Query("SELECT s FROM Space s LEFT JOIN FETCH s.pricings WHERE s.id = :id")
    Optional<Space> findByIdWithPricings(@Param("id") Long id);
    Optional<Space> findById(Long id);
}
