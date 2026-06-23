package hoyjugas.DTO.CashMovement;

import hoyjugas.Enum.CashMovementType;
import hoyjugas.Enum.PaymentMethod;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CashMovementFilterDTO {
    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;
    private PaymentMethod paymentMethod;
    private CashMovementType type;
    private Long employeeId;
    private int page = 0;
    private int size = 20;
    private String sortBy = "date";
    private String sortDirection = "desc";
}