package hoyjugas.DTO.Space;

import hoyjugas.Model.Space;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class SpaceCardDTO {
    private Long id;
    private String name;
    private String type;
    private Integer slotDuration;
    private Boolean isActive;
    private String imageUrl;
    private BigDecimal depositValue;

    public static SpaceCardDTO fromEntity(Space space) {
        SpaceCardDTO dto = new SpaceCardDTO();
        dto.setId(space.getId());
        dto.setName(space.getName());
        dto.setType(space.getType());
        dto.setSlotDuration(space.getSlotDuration());
        dto.setIsActive(space.getIsActive());
        dto.setImageUrl(space.getPhotoUrl());
        dto.setDepositValue(space.getDepositValue());
        return dto;
    }
}