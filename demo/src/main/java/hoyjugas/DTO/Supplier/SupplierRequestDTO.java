package hoyjugas.DTO.Supplier;

import hoyjugas.Enum.AccountType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class SupplierRequestDTO {
    @NotBlank(message = "El número de proveedor es obligatorio")
    private String supplierNumber;

    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @NotBlank(message = "El teléfono es obligatorio")
    @Size(min = 10, max = 20)
    private String phone;

    @NotBlank(message = "El CUIT es obligatorio")
    @Size(min = 11, max = 13)
    private String cuit;

    @NotNull(message = "El rubro es obligatorio")
    private Long categoryId;

    private String bank;
    private String accountNumber;
    private AccountType accountType;
    private Integer paymentTermDays;

    @DecimalMin(value = "0.00")
    @DecimalMax(value = "100.00")
    private BigDecimal discount;
}