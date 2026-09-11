package hoyjugas.DTO.Space;

import hoyjugas.DTO.SpacePricing.SpacePricingDTO;
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
    private BigDecimal fixedDeposit;
    private List<SpacePricingDTO> pricings;
    private String depositInfo;
    private String photoUrl;

    public static SpaceResponseDTO fromEntity(Space space) {
        SpaceResponseDTO dto = new SpaceResponseDTO();
        dto.setId(space.getId());
        dto.setName(space.getName());
        dto.setType(space.getType());
        dto.setSlotDuration(space.getSlotDuration());
        dto.setIsActive(space.getIsActive());
        dto.setFixedDeposit(space.getDepositValue());
        dto.setPhotoUrl(space.getPhotoUrl());
        dto.setPricings(space.getPricings().stream()
                .map(SpacePricingDTO::fromEntity)
                .sorted(Comparator.comparing(SpacePricingDTO::getDayType)
                        .thenComparing(SpacePricingDTO::getStartTime))
                .toList());

        dto.setDepositInfo(buildDepositInfo(space));
        return dto;
    }

    private static String buildDepositInfo(Space space) {
        if (space.getDepositValue() != null && space.getDepositValue().compareTo(BigDecimal.ZERO) > 0) {
            return String.format("Seña fija de $%s", space.getDepositValue().toPlainString());
        }
        return "Seña según configuración general";
    }
}