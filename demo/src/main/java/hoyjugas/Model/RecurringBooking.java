package hoyjugas.Model;

import hoyjugas.Enum.RecurringStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recurring_booking")
@Getter
@Setter
@NoArgsConstructor
public class RecurringBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "space_id", nullable = false)
    private Space space;

    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    private LocalTime startTime;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer intervalWeeks = 1;

    private Integer cancellationCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecurringStatus status = RecurringStatus.ACTIVO;

    @OneToMany(mappedBy = "recurringBooking", fetch = FetchType.LAZY)
    private List<Booking> bookings = new ArrayList<>();


}