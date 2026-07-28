package hoyjugas.Service;

import hoyjugas.DTO.Space.SpaceCardDTO;
import hoyjugas.DTO.Space.SpaceListDTO;
import hoyjugas.DTO.SpacePricing.SpacePricingRequestDTO;
import hoyjugas.DTO.Space.SpaceRequestDTO;
import hoyjugas.DTO.Space.SpaceResponseDTO;
import hoyjugas.Model.Space;
import hoyjugas.Model.SpacePricing;
import hoyjugas.Repository.HolidayRepository;
import hoyjugas.Repository.SpacePricingRepository;
import hoyjugas.Repository.SpaceRepository;
import hoyjugas.Repository.SpaceScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SpaceService {

    private final SpacePricingRepository spacePricingRepository;
    private final SpaceRepository spaceRepository;
    private final HolidayRepository holidayRepository;
    private final PricingService pricingService;
    private final SpaceScheduleRepository spaceScheduleRepository;

    @Transactional
    public SpaceResponseDTO createSpace(SpaceRequestDTO dto) {
        Space space = new Space();
        space.setName(dto.getName());
        space.setType(dto.getType());
        space.setSlotDuration(dto.getSlotDuration());
        space.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        space.setFixedDeposit(dto.getDepositFactor());
        space.setDepositValue(dto.getFixedDeposit());
        Space saved = spaceRepository.save(space);
        return SpaceResponseDTO.fromEntity(saved);
    }

    @Transactional
    public SpaceResponseDTO updateSpace(Long spaceId, SpaceRequestDTO dto) {
        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado"));
        space.setName(dto.getName());
        space.setType(dto.getType());
        space.setSlotDuration(dto.getSlotDuration());
        space.setIsActive(dto.getIsActive());
        space.setFixedDeposit(dto.getDepositFactor());
        space.setDepositValue(dto.getFixedDeposit());
        Space saved = spaceRepository.save(space);
        return SpaceResponseDTO.fromEntity(saved);
    }

    @Transactional
    public void toggleSpaceStatus(Long spaceId, boolean isActive) {
        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Espacio no encontrado"
                ));
        space.setIsActive(isActive);
        spaceRepository.save(space);
    }

    public SpaceResponseDTO getSpaceById(Long spaceId) {
        Space space = spaceRepository.findByIdWithPricings(spaceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Espacio no encontrado"
                ));
        return SpaceResponseDTO.fromEntity(space);
    }

    public List<SpaceListDTO> getAllSpacesActive() {
        return spaceRepository.findByIsActiveTrueOrderByNameAsc()
                .stream()
                .sorted(Comparator.comparing(Space::getIsActive))
                .map(SpaceListDTO::fromEntity)
                .toList();
    }

    public List<SpaceListDTO> getAllSpacesIncludingInactive() {
        return spaceRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Space::getName))
                .map(SpaceListDTO::fromEntity)
                .toList();
    }

    @Transactional
    public SpaceResponseDTO addPricing(Long spaceId, SpacePricingRequestDTO dto) {
        Space space = spaceRepository.findByIdWithPricings(spaceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Espacio no encontrado"
                ));
        checkOverlapping(spaceId,dto,null);
        SpacePricing pricing = new SpacePricing();
        pricing.setSpace(space);
        pricing.setDayType(dto.getDayType());
        pricing.setStartTime(dto.getStartTime());
        pricing.setEndTime(dto.getEndTime());
        pricing.setPrice(dto.getPrice());
        spacePricingRepository.save(pricing);
        return SpaceResponseDTO.fromEntity(space);
    }

    public void checkOverlapping(Long spaceId, SpacePricingRequestDTO dto, Long pricingId) {
        List<SpacePricing> overlaps;
        if (pricingId == null) {
            overlaps = spacePricingRepository.findOverlappingPricings(
                    spaceId,
                    dto.getDayType(),
                    dto.getStartTime(),
                    dto.getEndTime()
            );
        } else {
            overlaps = spacePricingRepository.findOverlappingPricingsExcludingId(
                    spaceId,
                    dto.getDayType(),
                    dto.getStartTime(),
                    dto.getEndTime(),
                    pricingId
            );
        }
        if (!overlaps.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe un precio en esa franja horaria"
            );
        }
    }

    @Transactional
    public SpaceResponseDTO updatePricing(Long spaceId, Long pricingId, SpacePricingRequestDTO dto) {
        Space space = spaceRepository.findByIdWithPricings(spaceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Espacio no encontrado"
                ));
        checkOverlapping(spaceId,dto,pricingId);
        SpacePricing pricing = space.getPricings().stream()
                .filter(p -> p.getId().equals(pricingId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Franja de precio no encontrada"
                ));
        pricing.setDayType(dto.getDayType());
        pricing.setStartTime(dto.getStartTime());
        pricing.setEndTime(dto.getEndTime());
        pricing.setPrice(dto.getPrice());
        spaceRepository.save(space);
        return SpaceResponseDTO.fromEntity(space);
    }

    @Transactional
    public SpaceResponseDTO deletePricing(Long spaceId, Long pricingId) {
        Space space = spaceRepository.findByIdWithPricings(spaceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Espacio no encontrado"
                ));

        SpacePricing pricing = space.getPricings().stream()
                .filter(p -> p.getId().equals(pricingId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Franja de precio no encontrada"
                ));
        space.getPricings().remove(pricing);
        spaceRepository.save(space);
        return SpaceResponseDTO.fromEntity(space);
    }

    public List<SpaceCardDTO> getSpaceCards() {
        return spaceRepository.findByIsActiveTrue()
                .stream()
                .map(SpaceCardDTO::fromEntity)
                .toList();
    }

    public SpaceCardDTO getSpaceCard(Long spaceId) {
        Space space = spaceRepository.findByIdAndIsActiveTrue(spaceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Espacio no encontrado"
                ));
        return SpaceCardDTO.fromEntity(space);
    }
}

