package hoyjugas.DTO.Expense;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ExpenseFilterDTO {
    private Long conceptId;
    private Long supplierId;
    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;
    private int page = 0;
    private int size = 20;
    private String sortBy = "date";
    private String sortDirection = "desc";
}