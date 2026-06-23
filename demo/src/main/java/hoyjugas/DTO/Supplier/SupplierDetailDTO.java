package hoyjugas.DTO.Supplier;

import hoyjugas.Model.Supplier;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class SupplierDetailDTO extends SupplierListDTO {

    private String whatsappUrl;
    private String bank;
    private String accountNumber;
    private String accountType;
    private Integer paymentTermDays;
    private BigDecimal discount;

    public static SupplierDetailDTO fromEntity(Supplier supplier) {
        SupplierDetailDTO dto = new SupplierDetailDTO();
        dto.setId(supplier.getId());
        dto.setSupplierNumber(supplier.getSupplierNumber());
        dto.setName(supplier.getName());
        dto.setPhone(supplier.getPhone());
        dto.setCuit(supplier.getCuit());
        dto.setCategoryName(supplier.getCategory() != null
                ? supplier.getCategory().getName() : null);
        dto.setIsActive(supplier.getIsActive());
        dto.setWhatsappUrl("https://wa.me/549" + supplier.getPhone());
        dto.setBank(supplier.getBank());
        dto.setAccountNumber(supplier.getAccountNumber());
        dto.setAccountType(supplier.getAccountType() != null
                ? supplier.getAccountType().name() : null);
        dto.setPaymentTermDays(supplier.getPaymentTermDays());
        dto.setDiscount(supplier.getDiscount());

        return dto;
    }
}