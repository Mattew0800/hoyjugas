package hoyjugas.DTO.SpaceSchedule;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SpaceScheduleDeleteRequestDTO {

    @NotNull(message = "El ID del horario es obligatorio")
    private Long scheduleId;

    @NotNull(message = "El ID del espacio es obligatorio")
    private Long spaceId;
}
