package hoyjugas.DTO.Sale;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class SalePageResponseDTO {

    private List<SaleResponseDTO> sales;
    private BigDecimal totalAmount;
    private long totalElements;
    private int totalPages;
    private int currentPage;
}