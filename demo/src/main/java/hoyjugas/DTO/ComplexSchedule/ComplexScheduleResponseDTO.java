package hoyjugas.DTO.ComplexSchedule;

import hoyjugas.Model.ComplexSchedule;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplexScheduleResponseDTO {
    private Long id;
    private String dayType;
    private LocalTime openingTime;
    private LocalTime closingTime;

    public static ComplexScheduleResponseDTO fromEntity(ComplexSchedule schedule) {
        return new ComplexScheduleResponseDTO(
                schedule.getId(),
                schedule.getDayType().name(),
                schedule.getOpeningTime(),
                schedule.getClosingTime()
        );
    }
}