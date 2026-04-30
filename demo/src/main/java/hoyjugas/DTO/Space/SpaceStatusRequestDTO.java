package hoyjugas.DTO.Space;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SpaceStatusRequestDTO {

    @NotNull(message = "El ID del espacio es obligatorio")
    private Long spaceId;

    @NotNull(message = "Debe indicar el estado")
    private Boolean isActive;
}