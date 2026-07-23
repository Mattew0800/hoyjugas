package hoyjugas.DTO.ComplexSchedule;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ComplexScheduleIdRequestDTO {
    @NotNull(message = "El id es obligatorio")
    private Long id;
}
