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
public class SpaceScheduleRequestDTO {

    @NotNull(message = "El tipo de día es obligatorio")
    private DayType dayType;

    @NotNull(message = "El horario de apertura es obligatorio")
    private LocalTime openingTime;

    @NotNull(message = "El horario de cierre es obligatorio")
    private LocalTime closingTime;
}
