package hoyjugas.DTO.User;

import hoyjugas.Enum.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EmployeeCardDTO {

    private String name;
    private String email;
    private String phone;
    private Role role;
    private boolean active;

}
