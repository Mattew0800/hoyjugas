package hoyjugas.Service;

import hoyjugas.DTO.Space.SpaceRequestDTO;
import hoyjugas.DTO.Space.SpaceResponseDTO;
import hoyjugas.Repository.HolidayRepository;
import hoyjugas.Repository.SpacePricingRepository;
import hoyjugas.Repository.SpaceRepository;
import hoyjugas.Repository.SpaceScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SpaceService {

    private final SpacePricingRepository spacePricingRepository;
    private final SpaceRepository spaceRepository;
    private final HolidayRepository holidayRepository;
    private final PricingService pricingService;
    private final SpaceScheduleRepository spaceScheduleRepository;

    private SpaceResponseDTO createSpaceResponseDTO(SpaceRequestDTO space) {
        SpaceResponseDTO spaceResponseDTO = new SpaceResponseDTO();


        return spaceResponseDTO;

    }
}
