package hoyjugas.DTO.Sale;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SaleCancelRequestDTO extends SaleIdRequestDTO{
    @NotBlank(message = "El pin es obligatorio")
    private String pin;
}
