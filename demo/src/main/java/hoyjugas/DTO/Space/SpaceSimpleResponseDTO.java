package hoyjugas.DTO.Space;

import hoyjugas.Model.Space;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SpaceSimpleResponseDTO {

    private BigDecimal fixedDeposit;

    public static SpaceSimpleResponseDTO fromEntity(Space space) {
        return SpaceSimpleResponseDTO.builder()
                .fixedDeposit(space.getDepositValue())
                .build();
    }
}