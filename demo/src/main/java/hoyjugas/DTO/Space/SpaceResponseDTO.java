package hoyjugas.DTO.Space;

import hoyjugas.Model.Space;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Data
public class SpaceResponseDTO {

    private Long id;
    private String name;
    private String type;
    private Integer slotDuration;
    private Boolean isActive;
    private BigDecimal depositFactor;
    private BigDecimal fixedDeposit;
    private List<SpacePricingDTO> pricings;
    private String depositInfo;       // texto legible: "Seña: 30% del total" o "Seña fija: $5.000"

    public static SpaceResponseDTO fromEntity(Space space) {
        SpaceResponseDTO dto = new SpaceResponseDTO();
        dto.setId(space.getId());
        dto.setName(space.getName());
        dto.setType(space.getType().name());
        dto.setSlotDuration(space.getSlotDuration());
        dto.setIsActive(space.getIsActive());
        dto.setDepositFactor(space.getDepositFactor());
        dto.setFixedDeposit(space.getFixedDeposit());

        dto.setPricings(space.getPricings().stream()
                .map(SpacePricingDTO::fromEntity)
                .sorted(Comparator.comparing(SpacePricingDTO::getDayType)
                        .thenComparing(SpacePricingDTO::getStartTime))
                .toList());

        dto.setDepositInfo(buildDepositInfo(space));
        return dto;
    }

    private static String buildDepositInfo(Space space) {
        if (space.getFixedDeposit() != null && space.getFixedDeposit().compareTo(BigDecimal.ZERO) > 0) {
            return String.format("Seña fija de $%s", space.getFixedDeposit().toPlainString());
        }
        BigDecimal factor = space.getDepositFactor();
        if (factor != null && factor.compareTo(BigDecimal.ZERO) > 0) {
            return String.format("Seña del %d%% del total", factor.multiply(new BigDecimal("100")).intValue());
        }
        return "Seña según configuración general";
    }
}