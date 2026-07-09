package hoyjugas.Repository;

import hoyjugas.Enum.DayType;
import hoyjugas.Model.SpaceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SpaceScheduleRepository extends JpaRepository<SpaceSchedule, Long> {
    Optional<SpaceSchedule> findBySpaceIdAndDayType(Long spaceId, DayType dayType);

    List<SpaceSchedule> findBySpaceId(Long spaceId);

    boolean existsBySpaceIdAndDayType(Long spaceId, DayType dayType);

}
