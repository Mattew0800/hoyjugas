package hoyjugas.DTO.User;

import hoyjugas.Enum.Role;
import hoyjugas.Model.User;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
public class EmployeeCreatedDTO {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String pin;

    public EmployeeCreatedDTO(User user, String rawPin) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.role = user.getRole().name();
        this.pin = rawPin;
    }

    public EmployeeCreatedDTO(LoginResponseDTO loginResponse, String rawPin,String phone, Long id) {
        this.email = loginResponse.getEmail();
        this.name = loginResponse.getName();
        this.pin = rawPin;
        this.role = Role.EMPLOYEE.name();
        this.phone = phone;
        this.id=id;
    }
}