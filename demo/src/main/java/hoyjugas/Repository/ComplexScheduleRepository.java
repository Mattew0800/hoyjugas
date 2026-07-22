package hoyjugas.Repository;

import hoyjugas.Enum.DayType;
import hoyjugas.Model.ComplexSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplexScheduleRepository extends JpaRepository<ComplexSchedule, Long> {
    Optional<ComplexSchedule> findByDayType(DayType dayType);
    boolean existsByDayType(DayType dayType);
    List<ComplexSchedule> findAllByDayTypeOrderByOpeningTime(DayType dayType);
}