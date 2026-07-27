package hoyjugas.DTO.System;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class SystemConfigScheduleResponseDTO {
    private LocalTime openingTime;
    private LocalTime closingTime;
}
