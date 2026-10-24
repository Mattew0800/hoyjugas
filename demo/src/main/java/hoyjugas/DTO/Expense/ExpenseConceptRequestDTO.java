package hoyjugas.DTO.Expense;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ExpenseConceptRequestDTO {
    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    private Boolean isExtra = false;
}