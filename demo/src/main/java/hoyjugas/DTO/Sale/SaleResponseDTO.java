package hoyjugas.DTO.Sale;

import hoyjugas.Model.Sale;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class SaleResponseDTO {
    private Long id;
    private String saleNumber;
    private LocalDateTime date;
    private String clientName;
    private String paymentMethod;
    private BigDecimal totalAmount;
    private String registeredByName;
    private String notes;
    private List<SaleItemResponseDTO> items;
    private List<String> stockAlerts;

    public static SaleResponseDTO fromEntity(Sale sale,List<String>alerts ) {
        SaleResponseDTO dto = new SaleResponseDTO();
        dto.setId(sale.getId());
        dto.setSaleNumber(sale.getSaleNumber());
        dto.setDate(sale.getDate());
        dto.setClientName(sale.getClient() != null
                ? sale.getClient().getName() : "Mostrador");
        dto.setPaymentMethod(sale.getPaymentMethod().name());
        dto.setTotalAmount(sale.getTotalAmount());
        dto.setRegisteredByName(sale.getRegisteredBy().getName());
        dto.setNotes(sale.getNotes());
        dto.setItems(sale.getItems().stream()
                .map(SaleItemResponseDTO::fromEntity)
                .toList());
        if(!alerts.isEmpty()){
            dto.setStockAlerts(alerts);
        }
        return dto;
    }
    public static SaleResponseDTO fromEntity(Sale sale) {
        return fromEntity(sale, null);
    }
}