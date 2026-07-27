package hoyjugas.DTO.ComplexSchedule;

import hoyjugas.Model.ComplexSchedule;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplexScheduleResponseDTO {
    private Long id;
    private String dayType;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private boolean isOpen;

    public ComplexScheduleResponseDTO(LocalTime openingTime, String dayType, LocalTime closingTime, boolean isOpen) {
        this.openingTime = openingTime;
        this.dayType = dayType;
        this.closingTime = closingTime;
        this.isOpen = isOpen;
    }

    public ComplexScheduleResponseDTO(String dayType, LocalTime openingTime, boolean isOpen) {
        this.dayType = dayType;
        this.isOpen = isOpen;
        this.openingTime = openingTime;
    }

    public ComplexScheduleResponseDTO(Long id, String dayType, LocalTime openingTime, LocalTime closingTime) {
        this.dayType = dayType;
        this.id = id;
        this.openingTime = openingTime;
        this.closingTime = closingTime;
    }

    public static ComplexScheduleResponseDTO fromEntity(ComplexSchedule schedule) {
        return new ComplexScheduleResponseDTO(
                schedule.getId(),
                schedule.getDayType().name(),
                schedule.getOpeningTime(),
                schedule.getClosingTime()
        );
    }
}