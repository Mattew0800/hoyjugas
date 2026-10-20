package hoyjugas.DTO.GoodsReceipt;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GoodsReceiptFilterDTO {
    private Long supplierId;
    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;
    private int page = 0;
    private int size = 20;
    private String sortBy = "date";
    private String sortDirection = "desc";
}