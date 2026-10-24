package hoyjugas.DTO.Expense;

import hoyjugas.Model.Expense;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ExpenseResponseDTO {
    private Long id;
    private String movementNumber;
    private LocalDateTime date;
    private String conceptName;
    private String voucher;
    private BigDecimal amount;
    private String detail;
    private String supplierName;
    private String registeredByName;
    private String paymentMethod;

    public static ExpenseResponseDTO fromEntity(Expense expense) {
        ExpenseResponseDTO dto = new ExpenseResponseDTO();
        dto.setId(expense.getId());
        dto.setMovementNumber(expense.getMovementNumber());
        dto.setDate(expense.getDate());
        dto.setConceptName(expense.getConcept().getName());
        dto.setVoucher(expense.getVoucher());
        dto.setAmount(expense.getAmount());
        dto.setDetail(expense.getDetail());
        dto.setSupplierName(expense.getSupplier() != null
                ? expense.getSupplier().getName() : null);
        dto.setRegisteredByName(expense.getRegisteredBy().getName());
        dto.setPaymentMethod(expense.getPaymentMethod().name());
        return dto;
    }
}