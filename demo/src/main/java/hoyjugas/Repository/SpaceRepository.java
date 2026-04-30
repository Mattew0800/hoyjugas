package hoyjugas.Repository;

import hoyjugas.Enum.SpaceType;
import hoyjugas.Model.Space;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SpaceRepository extends JpaRepository<Space, Integer> {
    List<Space> findByIsActiveTrue();
    List<Space> findByTypeAndIsActiveTrue(SpaceType type);
    Optional<Space> findByIdAndIsActiveTrue(Long id);
}
