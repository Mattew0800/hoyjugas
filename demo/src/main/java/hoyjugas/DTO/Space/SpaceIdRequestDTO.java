package hoyjugas.DTO.Space;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SpaceIdRequestDTO {

    @NotNull(message = "El id es obligatorio")
    Long spaceId;
}
