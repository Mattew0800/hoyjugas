package hoyjugas.DTO.Stock;

import hoyjugas.Enum.MovementType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StockMovementFilterDTO {
    private MovementType type;
    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;
    private int page = 0;
    private int size = 20;
    private String sortBy = "createdAt";
    private String sortDirection = "desc";
}