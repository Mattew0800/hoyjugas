package hoyjugas.DTO.Space;

import hoyjugas.Enum.DayType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class SpacePricingRequestDTO {

    @NotNull(message = "El tipo de día es obligatorio")
    private DayType dayType;

    @NotNull(message = "La hora de inicio es obligatoria")
    private LocalTime startTime;

    @NotNull(message = "La hora de fin es obligatoria")
    private LocalTime endTime;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    private BigDecimal price;

    @AssertTrue(message = "La hora de fin debe ser posterior a la de inicio")
    public boolean isTimeRangeValid() {
        return startTime != null && endTime != null && endTime.isAfter(startTime);
    }
}