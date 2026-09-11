package hoyjugas.DTO.Space;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class SpaceRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    private String name;

    @NotBlank(message = "El tipo de espacio no puede estar vacío")
    @Size(max = 100, message = "El tipo es demasiado largo")
    private String type;

    @NotNull(message = "La duración del turno es obligatoria")
    @Min(value = 15, message = "La duración mínima es 15 minutos")
    @Max(value = 480, message = "La duración máxima es 8 horas")
    private Integer slotDuration;

    @NotNull(message = "Debe indicar si está activo")
    private Boolean isActive;

    @NotNull(message = "La seña fija es obligatoria")
    @DecimalMin(value = "0.01", message = "La seña fija debe ser mayor a 0")
    private BigDecimal fixedDeposit;

    @Size(max=500)
    private String photoUrl;
}