package hoyjugas.DTO.Supplier;

import hoyjugas.Model.Supplier;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SupplierListDTO {
    private Long id;
    private String supplierNumber;
    private String name;
    private String phone;
    private String cuit;
    private String categoryName;
    private Boolean isActive;

    public static SupplierListDTO fromEntity(Supplier supplier) {
        SupplierListDTO dto = new SupplierListDTO();
        dto.setId(supplier.getId());
        dto.setSupplierNumber(supplier.getSupplierNumber());
        dto.setName(supplier.getName());
        dto.setPhone(supplier.getPhone());
        dto.setCuit(supplier.getCuit());
        dto.setCategoryName(supplier.getCategory() != null
                ? supplier.getCategory().getName() : null);
        dto.setIsActive(supplier.getIsActive());
        return dto;
    }
}