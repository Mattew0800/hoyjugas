package hoyjugas.DTO.SpacePricing;

import hoyjugas.Model.SpacePricing;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class SpacePricingDTO {

    private Long id;
    private String dayType;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal price;

    public static SpacePricingDTO fromEntity(SpacePricing pricing) {
        SpacePricingDTO dto = new SpacePricingDTO();
        dto.setId(pricing.getId());
        dto.setDayType(pricing.getDayType().name());
        dto.setStartTime(pricing.getStartTime());
        dto.setEndTime(pricing.getEndTime());
        dto.setPrice(pricing.getPrice());
        return dto;
    }
}