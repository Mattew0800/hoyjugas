package hoyjugas.DTO.Sale;

import hoyjugas.Enum.PaymentMethod;
import hoyjugas.Enum.SaleStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SaleFilterDTO {
    private Long clientId;
    private Long employeeId;
    private PaymentMethod paymentMethod;
    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;
    private int page = 0;
    private int size = 20;
    private String sortBy = "date";
    private String sortDirection = "desc";
    private SaleStatus status;
}