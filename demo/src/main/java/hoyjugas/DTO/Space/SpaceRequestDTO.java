package hoyjugas.DTO.Space;

import hoyjugas.Enum.SpaceType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class SpaceRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    private String name;

    @NotNull(message = "El tipo de espacio es obligatorio")
    private SpaceType type;

    @NotNull(message = "La duración del turno es obligatoria")
    @Min(value = 15, message = "La duración mínima es 15 minutos")
    @Max(value = 480, message = "La duración máxima es 8 horas")
    private Integer slotDuration;

    @NotNull(message = "Debe indicar si está activo")
    private Boolean isActive;

    @DecimalMin(value = "0.01", message = "El factor de seña debe ser mayor a 0")
    @DecimalMax(value = "1.00", message = "El factor de seña no puede superar 1.00")
    private BigDecimal depositFactor;

    @DecimalMin(value = "0.01", message = "La seña fija debe ser mayor a 0")
    private BigDecimal depositValue;
}