package hoyjugas.DTO.CashMovement;

import hoyjugas.Model.CashMovement;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class CashMovementListDTO {
    private Long id;
    private String receiptNumber;
    private LocalDateTime date;
    private String type;
    private String paymentMethod;
    private BigDecimal amount;
    private String clientOrConcept;     // calculado según tipo
    private String registeredByName;

    public static CashMovementListDTO fromEntity(CashMovement movement) {
        CashMovementListDTO dto = new CashMovementListDTO();
        dto.setId(movement.getId());
        dto.setReceiptNumber(movement.getReceiptNumber());
        dto.setDate(movement.getDate());
        dto.setType(movement.getType().name());
        dto.setPaymentMethod(movement.getPaymentMethod().name());
        dto.setAmount(movement.getAmount());
        dto.setRegisteredByName(movement.getRegisteredBy().getName());
        dto.setClientOrConcept(resolveClientOrConcept(movement));
        return dto;
    }

    private static String resolveClientOrConcept(CashMovement movement) {
        return switch (movement.getType()) {
            case TURNO, DEVOLUCION -> movement.getBooking() != null
                    ? movement.getBooking().getClient().getName()
                    : "-";
            case VENTA -> movement.getSale() != null && movement.getSale().getClient() != null
                    ? movement.getSale().getClient().getName()
                    : "Mostrador";
            case GASTO -> movement.getExpense() != null
                    ? movement.getExpense().getConcept().getName()
                    : "-";
        };
    }
}