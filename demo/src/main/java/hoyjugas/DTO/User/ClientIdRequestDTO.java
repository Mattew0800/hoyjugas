package hoyjugas.DTO.User;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClientIdRequestDTO {
    @NotNull(message = "El ID del cliente es obligatorio")
    private Long clientId;
}
