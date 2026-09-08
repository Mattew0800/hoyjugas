package hoyjugas.DTO.User;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateEmployeeRequestDTO {
    @NotNull(message = "El id es obligatorio")
    private Long id;

    private String name;
    private String email;
    private String phone;
    private String dni;
    private String password;
}