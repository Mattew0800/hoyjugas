package hoyjugas.DTO.Stock;

import hoyjugas.Enum.MovementType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MovementRequestDTO {
    @NotNull(message = "El tipo es obligatorio")
    private MovementType type;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1)
    private Integer quantity;

    @NotBlank(message = "El motivo es obligatorio")
    private String reason;

    @NotBlank(message = "El PIN es obligatorio")
    private String employeePin;
}