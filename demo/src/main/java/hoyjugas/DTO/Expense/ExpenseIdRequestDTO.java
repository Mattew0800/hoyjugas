package hoyjugas.DTO.Expense;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExpenseIdRequestDTO {
    @NotNull(message = "El id es obligatorio")
    private Long id;
}