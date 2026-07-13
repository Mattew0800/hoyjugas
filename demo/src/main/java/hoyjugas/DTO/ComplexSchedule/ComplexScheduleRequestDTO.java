package hoyjugas.DTO.ComplexSchedule;

import hoyjugas.Enum.DayType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalTime;

@Data
public class ComplexScheduleRequestDTO {
    @NotNull(message = "El día es obligatorio")
    private DayType dayType;

    @NotNull(message = "El horario de apertura es obligatorio")
    private LocalTime openingTime;

    @NotNull(message = "El horario de cierre es obligatorio")
    private LocalTime closingTime;
}