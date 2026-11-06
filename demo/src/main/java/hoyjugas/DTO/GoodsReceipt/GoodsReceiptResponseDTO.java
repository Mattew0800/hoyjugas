package hoyjugas.DTO.GoodsReceipt;

import hoyjugas.Model.GoodsReceipt;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class GoodsReceiptResponseDTO {
    private Long id;
    private String movementNumber;
    private LocalDateTime date;
    private String supplierName;
    private String voucher;
    private String paymentMethod;
    private BigDecimal totalAmount;
    private String registeredByName;
    private String notes;
    private List<GoodsReceiptItemResponseDTO> items;

    public static GoodsReceiptResponseDTO fromEntity(GoodsReceipt receipt) {
        GoodsReceiptResponseDTO dto = new GoodsReceiptResponseDTO();
        dto.setId(receipt.getId());
        dto.setMovementNumber(receipt.getMovementNumber());
        dto.setDate(receipt.getDate());
        dto.setSupplierName(receipt.getSupplier().getName());
        dto.setVoucher(receipt.getVoucher());
        dto.setPaymentMethod(receipt.getPaymentMethod().name());
        dto.setTotalAmount(receipt.getTotalAmount());
        dto.setRegisteredByName(receipt.getRegisteredBy().getName());
        dto.setNotes(receipt.getNotes());
        dto.setItems(receipt.getItems().stream()
                .map(GoodsReceiptItemResponseDTO::fromEntity)
                .toList());
        return dto;
    }
}