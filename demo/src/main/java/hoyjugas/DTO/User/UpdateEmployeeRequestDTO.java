package hoyjugas.DTO.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateEmployeeRequestDTO {
    @NotNull(message = "El id es obligatorio")
    private Long id;

    @Pattern(
            regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ]{2,}(?:\\s[A-Za-zÁÉÍÓÚáéíóúÑñ]{2,})+$",
            message = "Debe ingresar nombre y apellido válidos"
    )
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    private String name;

    @Email(message = "Email inválido")
    @Size(max = 100, message = "El email no puede superar los 100 caracteres")
    private String email;

    @Size(min = 6, max = 100, message = "La contraseña debe tener entre 6 y 100 caracteres")
    private String password;

    @Pattern(regexp = "^\\d{7,10}$", message = "El DNI debe tener entre 7 y 10 dígitos numéricos")
    private String dni;

    @Pattern(regexp = "^[0-9]{10}$", message = "El teléfono debe tener 10 dígitos numéricos")
    private String phone;
}