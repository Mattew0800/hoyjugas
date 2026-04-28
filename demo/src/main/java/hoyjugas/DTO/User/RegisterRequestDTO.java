package hoyjugas.DTO.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequestDTO {

    @Pattern(
            regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ]{2,}(?:\\s[A-Za-zÁÉÍÓÚáéíóúÑñ]{2,})+$",
            message = "Debe ingresar nombre y apellido válidos"
    )
    @NotBlank(message = "El nombre es requerido")
    @Size(min = 2, max = 50 ,message= "El nombre debe tener entre 2 y 50 caracteres")
    private String name;

    @NotBlank(message = "El email es requerido")
    @Email(message = "Email inválido")
    @Size(max = 100, message = "El email no puede superar los 100 caracteres")
    private String email;

    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 6, max = 100, message = "La contraseña debe tener entre 6 y 100 caracteres")
    private String password;

    @NotBlank(message = "El DNI es requerido")
    @Pattern(regexp = "^\\d{7,10}$", message = "El DNI debe tener entre 7 y 10 dígitos numéricos")
    private String dni;

    @NotBlank(message = "El teléfono es requerido")
    @Pattern(regexp = "^[0-9]{10}$", message = "El teléfono debe tener 10 dígitos numéricos")
    private String phone;
}
