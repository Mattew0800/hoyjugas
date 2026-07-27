package hoyjugas.DTO.RecurringBooking;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class RecurringBookingPreviewDTO {
    private Long spaceId;
    private String spaceName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer intervalWeeks;
    private Integer totalSlotsGenerated;
    private Integer conflictingSlots;
    private List<LocalDateTime> conflicts;
    private List<LocalDateTime> available;
    private BigDecimal firstDepositAmount;
}