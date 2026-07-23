package hoyjugas.DTO.ComplexSchedule;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class ComplexScheduleUpdateRequestDTO extends ComplexScheduleRequestDTO{
    @NotNull(message = "El id es obligatorio")
     private Long id;
}
