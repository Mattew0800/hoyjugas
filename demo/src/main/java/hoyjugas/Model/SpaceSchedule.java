package hoyjugas.Model;

import hoyjugas.Enum.DayType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalTime;

@Entity
@Table(name = "space_schedule")
@Getter
@Setter
@NoArgsConstructor
public class SpaceSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "space_id", nullable = false)
    private Space space;

    @Enumerated(EnumType.STRING)
    private DayType dayType;

    private LocalTime openingTime;
    private LocalTime closingTime;
}