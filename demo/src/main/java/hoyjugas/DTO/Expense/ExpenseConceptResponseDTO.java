package hoyjugas.DTO.Expense;

import hoyjugas.Model.ExpenseConcept;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ExpenseConceptResponseDTO {
    private Long id;
    private String name;
    private Boolean isExtra;
    private Boolean isActive;

    public static ExpenseConceptResponseDTO fromEntity(ExpenseConcept concept) {
        ExpenseConceptResponseDTO dto = new ExpenseConceptResponseDTO();
        dto.setId(concept.getId());
        dto.setName(concept.getName());
        dto.setIsExtra(concept.getIsExtra());
        dto.setIsActive(concept.getIsActive());
        return dto;
    }
}