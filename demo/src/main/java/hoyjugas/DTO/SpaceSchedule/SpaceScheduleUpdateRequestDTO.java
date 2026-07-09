package hoyjugas.DTO.SpaceSchedule;

import hoyjugas.Enum.DayType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
public class SpaceScheduleUpdateRequestDTO {

    @NotNull(message = "El ID del horario es obligatorio")
    private Long scheduleId;

    @NotNull(message = "El ID del espacio es obligatorio")
    private Long spaceId;

    @NotNull(message = "El tipo de día es obligatorio")
    private DayType dayType;

    @NotNull(message = "El horario de apertura es obligatorio")
    private LocalTime openingTime;

    @NotNull(message = "El horario de cierre es obligatorio")
    private LocalTime closingTime;

    public SpaceScheduleRequestDTO toScheduleRequestDTO() {
        SpaceScheduleRequestDTO dto = new SpaceScheduleRequestDTO();
        dto.setDayType(this.dayType);
        dto.setOpeningTime(this.openingTime);
        dto.setClosingTime(this.closingTime);
        return dto;
    }
}
