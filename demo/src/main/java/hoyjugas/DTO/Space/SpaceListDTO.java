package hoyjugas.DTO.Space;

import hoyjugas.Model.Space;
import lombok.Data;

@Data
public class SpaceListDTO {

    private Long id;
    private String name;
    private String type;
    private Integer slotDuration;
    private Boolean isActive;
    private int pricingCount;

    public static SpaceListDTO fromEntity(Space space) {
        SpaceListDTO dto = new SpaceListDTO();
        dto.setId(space.getId());
        dto.setName(space.getName());
        dto.setType(space.getType().name());
        dto.setSlotDuration(space.getSlotDuration());
        dto.setIsActive(space.getIsActive());
        dto.setPricingCount(space.getPricings().size());
        return dto;
    }
}