package hoyjugas.DTO.User;

import hoyjugas.Model.User;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class EmployeeDetailDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String phone;
    private String dni;

    public static EmployeeDetailDTO fromEntity(User user) {
        EmployeeDetailDTO dto = new EmployeeDetailDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setPhone(user.getPhone());
        dto.setDni(user.getDni());
        return dto;
    }
}