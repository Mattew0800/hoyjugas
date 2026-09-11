package hoyjugas.Service;

import hoyjugas.DTO.Booking.CancelBookingRequestDTO;
import hoyjugas.DTO.RecurringBooking.*;
import hoyjugas.Enum.*;
import hoyjugas.Model.*;
import hoyjugas.Repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RecurringBookingService extends BaseBookingService{

    private final RecurringBookingRepository recurringBookingRepository;
    private final BookingRepository bookingRepository;
    private final SpaceRepository spaceRepository;
    private final UserRepository userRepository;
    private final PricingService pricingService;
    private final PaymentRepository paymentRepository;

    public RecurringBookingService(
            BookingNotificationRepository bookingNotificationRepository,
            SystemConfigRepository systemConfigRepository,
            RecurringBookingRepository recurringBookingRepository,
            BookingRepository bookingRepository,
            SpaceRepository spaceRepository,
            UserRepository userRepository,
            PricingService pricingService,PaymentRepository paymentRepository) {
        super(bookingNotificationRepository, systemConfigRepository,userRepository,spaceRepository,paymentRepository,bookingRepository);
        this.recurringBookingRepository = recurringBookingRepository;
        this.bookingRepository = bookingRepository;
        this.spaceRepository = spaceRepository;
        this.userRepository = userRepository;
        this.pricingService = pricingService;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public RecurringBookingResponseDTO createRecurringBooking(RecurringBookingRequestDTO dto, User employee) {
        User client = getClientOrThrow(dto.getClientId());
        Space space = getActiveSpaceOrThrow(dto.getSpaceId());
        SystemConfig config = getSystemConfig();

        LocalDate endDate = dto.getEndDate() != null
                ? dto.getEndDate()
                : LocalDate.of(LocalDate.now().getYear(), 12, 31);
        DayType specificDay = pricingService.resolveSpecificDayType(dto.getStartDate().getDayOfWeek());
        boolean alreadyExists = recurringBookingRepository.existsActiveRecurring(
                client.getId(), space.getId(), specificDay, dto.getStartTime(), RecurringStatus.ACTIVO);
        if (alreadyExists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un turno fijo activo para ese cliente, espacio y horario");
        }

        RecurringBooking recurring = new RecurringBooking();
        recurring.setClient(client);
        recurring.setSpace(space);
        recurring.setDayOfWeek(specificDay);
        recurring.setStartTime(dto.getStartTime());
        recurring.setStartDate(dto.getStartDate());
        recurring.setEndDate(endDate);
        recurring.setIntervalWeeks(dto.getIntervalWeeks() != null ? dto.getIntervalWeeks() : 1);
        recurring.setSlots(dto.getSlots() != null ? dto.getSlots() : 1);
        recurring.setStatus(RecurringStatus.ACTIVO);
        RecurringBooking saved = recurringBookingRepository.save(recurring);
        List<Booking> bookingsGenerated = generateBookings(saved, space);
        bookingRepository.saveAll(bookingsGenerated);
        bookingRepository.flush();
        if (!bookingsGenerated.isEmpty()) {
            for (Booking b : bookingsGenerated) {
                String bn = "BK-" + String.format("%08d", b.getId());
                bookingRepository.updateBookingNumber(b.getId(), bn);
                b.setBookingNumber(bn);
            }
            Booking firstBooking = bookingsGenerated.get(0);
            BigDecimal depositAmount = calculateRecurringDeposit(
                    1, firstBooking.getTotalAmount(), space, config);
            if (dto.getDepositAmount().compareTo(depositAmount) != 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "El monto del deposito debe ser igual al necesario");
            }
            Payment deposit = buildPayment(
                    firstBooking, dto.getPaymentMethod(), depositAmount,
                    dto.getTransactionId(), employee, PaymentType.DEPOSITO);
            paymentRepository.save(deposit);
            firstBooking.setPaymentStatus(
                    calculatePaymentStatus(firstBooking.getId(), firstBooking.getTotalAmount()));
            bookingRepository.save(firstBooking);
        }
        RecurringBookingResponseDTO response = RecurringBookingResponseDTO
                .fromEntity(saved, bookingsGenerated);
        response.setDepositLabel(String.format("Las primeras %d veces la seña mayor que el valor normal", config.getRecurringInitialDepositTurns()));
        response.setSlots(buildSlots(bookingsGenerated, config.getRecurringInitialDepositTurns()));
        return response;
    }

    protected BigDecimal calculateRecurringDeposit(int bookingNumber,BigDecimal totalPrice,Space space, SystemConfig config) {
        BigDecimal deposit = space.getDepositValue();
        if (bookingNumber <= config.getRecurringInitialDepositTurns()) {
            deposit = deposit.multiply(config.getRecurringDepositMultiplier());
        }
        return deposit.min(totalPrice);
    }

    private List<Booking> generateBookings(RecurringBooking recurring, Space space) {
        List<Booking> bookings = new ArrayList<>();
        LocalDate current = recurring.getStartDate();
        int slots = recurring.getSlots() != null ? recurring.getSlots() : 1;
        while (!current.isAfter(recurring.getEndDate())) {
            LocalDateTime startDatetime = LocalDateTime.of(current, recurring.getStartTime());
            LocalDateTime endDatetime = startDatetime
                    .plusMinutes(space.getSlotDuration() * slots);
            boolean ocupado = bookingRepository.existsOverlappingBooking(
                    space.getId(), startDatetime, endDatetime, BookingStatus.CANCELADO);
            if (!ocupado) {
                BigDecimal price = pricingService.getPriceForSlot(space, startDatetime)
                        .multiply(BigDecimal.valueOf(slots));
                Booking booking = new Booking();
                booking.setClient(recurring.getClient());
                booking.setSpace(space);
                booking.setStartDatetime(startDatetime);
                booking.setEndDatetime(endDatetime);
                booking.setTotalAmount(price);
                booking.setBookingStatus(BookingStatus.CONFIRMADO);
                booking.setPaymentStatus(PaymentStatus.NO_PAGADO);
                booking.setRecurringBooking(recurring);
                booking.setTermsAccepted(true);
                booking.setTermsAcceptedAt(LocalDateTime.now());
                bookings.add(booking);
                booking.setSlots(slots);
            }
            current = current.plusWeeks(recurring.getIntervalWeeks());
        }
        return bookings;
    }

    public RecurringBookingPreviewDTO previewRecurringBooking(RecurringBookingRequestDTO dto) {
        Space space = getActiveSpaceOrThrow(dto.getSpaceId());
        SystemConfig config = getSystemConfig();
        LocalDate endDate = dto.getEndDate() != null
                ? dto.getEndDate()
                : LocalDate.of(LocalDate.now().getYear(), 12, 31);
        List<LocalDateTime> available = new ArrayList<>();
        List<LocalDateTime> conflicts = new ArrayList<>();
        LocalDate current = dto.getStartDate();
        int intervalWeeks = dto.getIntervalWeeks() != null ? dto.getIntervalWeeks() : 1;
        while (!current.isAfter(endDate)) {
            LocalDateTime startDatetime = LocalDateTime.of(current, dto.getStartTime());
            LocalDateTime endDatetime = startDatetime.plusMinutes(space.getSlotDuration());
            boolean ocupado = bookingRepository.existsOverlappingBooking(
                    space.getId(),
                    startDatetime,
                    endDatetime,
                    BookingStatus.CANCELADO
            );
            if (ocupado) {
                conflicts.add(startDatetime);
            } else {
                available.add(startDatetime);
            }
            current = current.plusWeeks(intervalWeeks);
        }
        BigDecimal price = pricingService.getPriceForSlot(space,
                LocalDateTime.of(dto.getStartDate(), dto.getStartTime()));
        BigDecimal firstDeposit = calculateRecurringDeposit(1, price,space, config);
        RecurringBookingPreviewDTO preview = new RecurringBookingPreviewDTO();
        preview.setSpaceId(space.getId());
        preview.setSpaceName(space.getName());
        preview.setStartDate(dto.getStartDate());
        preview.setEndDate(endDate);
        preview.setIntervalWeeks(intervalWeeks);
        preview.setTotalSlotsGenerated(available.size());
        preview.setConflictingSlots(conflicts.size());
        preview.setConflicts(conflicts);
        preview.setAvailable(available);
        preview.setFirstDepositAmount(firstDeposit);
        return preview;
    }


    @Transactional
    public RecurringCancelResponseDTO cancelOneBooking(Long bookingId, CancelBookingRequestDTO dto, User employee) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Turno no encontrado"));
        if (booking.getRecurringBooking() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El turno no pertenece a un ciclo fijo");
        }
        if (booking.getBookingStatus().equals(BookingStatus.CANCELADO)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El turno ya está cancelado");
        }
        RecurringBooking recurring = booking.getRecurringBooking();
        SystemConfig config = getSystemConfig();
        booking.setBookingStatus(BookingStatus.CANCELADO);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancellationReason(dto.getCancellationReason());
        booking.setRefunded(false);
        bookingRepository.save(booking);
        recurring.setCancellationCount(recurring.getCancellationCount() + 1);
        boolean completedCycle = recurring.getCancellationCount() >= config.getMaxRecurringCancellations();
        if (completedCycle) {
            cancelFutureBookings(recurring, dto.getCancellationReason());
            recurring.setCancelledBy(employee);
            recurring.setCancelledAt(LocalDateTime.now());
            recurring.setStatus(RecurringStatus.CANCELADO);
        }
        recurringBookingRepository.save(recurring);
        scheduleNotification(booking, NotificationType.CANCELACION);
        return new RecurringCancelResponseDTO(
                bookingId,
                completedCycle,
                recurring.getCancellationCount(),
                config.getMaxRecurringCancellations()
        );
    }

    @Transactional
    public void cancelFutureBookings(RecurringBooking recurring, String motivo) {
        List<Booking> futuros = bookingRepository
                .findFutureActiveByRecurringId(recurring.getId(), LocalDateTime.now(),BookingStatus.CANCELADO);
        futuros.forEach(b -> {
            b.setBookingStatus(BookingStatus.CANCELADO);
            b.setCancelledAt(LocalDateTime.now());
            b.setCancellationReason("Ciclo cancelado: " + motivo);
            b.setRefunded(false);
        });
        bookingRepository.saveAll(futuros);
    }

    @Transactional
    public void cancelRecurringCycle(Long recurringId, String cancellationReason, Long requesterId, User employee) {
        RecurringBooking recurring = recurringBookingRepository.findById(recurringId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ciclo no encontrado"));
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (requester.getRole().equals(Role.USER) &&
                !recurring.getClient().getId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "No tenés permiso para cancelar el ciclo de otro cliente");
        }
        if (recurring.getStatus().equals(RecurringStatus.CANCELADO)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El ciclo ya está cancelado");
        }
        cancelFutureBookings(recurring, cancellationReason);
        recurring.setStatus(RecurringStatus.CANCELADO);
        recurring.setCancelledAt(LocalDateTime.now());
        recurring.setCancelledBy(employee != null ? employee : requester);
        recurringBookingRepository.save(recurring);
    }

    public Page<RecurringBookingResponseDTO> getRecurringByClient(Long requesterId, RecurringBookingFilterRequestDTO dto) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        Long clientId = requester.getRole().equals(Role.USER)
                ? requesterId
                : dto.getClientId();
        Pageable pageable = PageRequest.of(
                dto.getPage(),
                dto.getSize(),
                Sort.by(Sort.Direction.fromString(dto.getSortDirection()), dto.getSortBy())
        );
        return recurringBookingRepository.findAllWithFilters(
                clientId,
                dto.getSpaceId(),
                dto.getStatus(),
                dto.getDayOfWeek(),
                dto.getCancelledByEmployeeId(),
                dto.getStartDateFrom(),
                dto.getStartDateTo(),
                pageable
        ).map(r -> {List<Booking> bookings = bookingRepository
                .findByRecurringBookingIdOrderByStartDatetimeAsc(r.getId());
            BigDecimal firstDeposit = bookings.isEmpty() ? BigDecimal.ZERO
                    : paymentRepository.findTotalByBookingIdAndType(
                    bookings.get(0).getId(),
                    PaymentType.DEPOSITO,
                    PaymentStatus.PAGADO);
            return RecurringBookingResponseDTO.fromEntity(r, bookings, firstDeposit);
        });
    }

    private List<RecurringBookingSlotDTO> buildSlots(List<Booking> bookings,int turnsWithDoubleDeposit ) {
        List<RecurringBookingSlotDTO> slots = new ArrayList<>();
        int turnNumber = 1;
        for (Booking booking : bookings) {
            BigDecimal depositPaid = paymentRepository
                    .findTotalByBookingIdAndType(
                            booking.getId(),
                            PaymentType.DEPOSITO,
                            PaymentStatus.PAGADO
                    );
            BigDecimal totalCollected = paymentRepository
                    .findTotalByBookingIdExcludingType(
                            booking.getId(),
                            PaymentType.DEVOLUCION,
                            PaymentStatus.PAGADO
                    );
            BigDecimal remaining = booking.getTotalAmount()
                    .subtract(totalCollected)
                    .max(BigDecimal.ZERO);
            booking.setPaymentStatus(
                    calculatePaymentStatus(booking.getId(), booking.getTotalAmount())
            );
            slots.add(RecurringBookingSlotDTO.fromEntity(booking,turnNumber,turnsWithDoubleDeposit,depositPaid,remaining));
            turnNumber++;
        }
        return slots;
    }

    public List<RecurringBookingResponseDTO> getFutureRecurringBookings(Long requesterId, Role role, Long targetClientId) {
        LocalDate today = LocalDate.now();
        SystemConfig config = getSystemConfig();
        List<RecurringBooking> recurrences;
        if (role == Role.USER) {
            recurrences = recurringBookingRepository
                    .findByClientIdAndStatusAndEndDateGreaterThanEqual(
                            requesterId, RecurringStatus.ACTIVO, today);
        } else if (targetClientId != null) {
            recurrences = recurringBookingRepository
                    .findByClientIdAndStatusAndEndDateGreaterThanEqual(
                            targetClientId, RecurringStatus.ACTIVO, today);
        } else {
            recurrences = recurringBookingRepository
                    .findByStatusAndEndDateGreaterThanEqual(
                            RecurringStatus.ACTIVO, today);
        }
        return recurrences.stream()
                .map(recurring -> {
                    Space space = recurring.getSpace();
                    List<Booking> allBookings = bookingRepository
                            .findByRecurringBookingIdOrderByStartDatetimeAsc(recurring.getId());
                    BigDecimal firstDeposit = BigDecimal.ZERO;
                    if (!allBookings.isEmpty()) {
                        Booking firstBooking = allBookings.get(0);
                        firstDeposit = calculateRecurringDeposit(
                                1, firstBooking.getTotalAmount(), space, config);
                    }
                    RecurringBookingResponseDTO dto = RecurringBookingResponseDTO
                            .fromEntity(recurring, allBookings, firstDeposit);
                    int initialDepositTurns = config.getRecurringInitialDepositTurns();
                    List<RecurringBookingSlotDTO> slots = new ArrayList<>();
                    for (int i = 0; i < allBookings.size(); i++) {
                        Booking booking = allBookings.get(i);
                        if (booking.getStartDatetime().isBefore(LocalDateTime.now())) {
                            continue;
                        }
                        if (booking.getBookingStatus() == BookingStatus.CANCELADO) {
                            continue;
                        }
                        int recurringSlotNumber = i + 1;
                        BigDecimal expectedDeposit = calculateRecurringDeposit(
                                recurringSlotNumber, booking.getTotalAmount(), space, config);
                        BigDecimal paidDeposit = paymentRepository.findTotalByBookingIdAndType(
                                booking.getId(), PaymentType.DEPOSITO, PaymentStatus.PAGADO);
                        BigDecimal remaining = booking.getTotalAmount().subtract(
                                paidDeposit != null ? paidDeposit : BigDecimal.ZERO);
                        slots.add(RecurringBookingSlotDTO.fromEntity(
                                booking, recurringSlotNumber, initialDepositTurns,
                                paidDeposit != null ? paidDeposit : BigDecimal.ZERO,
                                remaining));
                    }
                    dto.setSlots(slots);
                    return dto;
                })
                .toList();
    }

    public RecurringBookingDetailDTO getRecurringBookingByBookingId(Long bookingId, Long requesterId, Role role) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Turno no encontrado"));
        if (role == Role.USER && !booking.getClient().getId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "No tenés permiso para ver este turno");
        }
        RecurringBooking recurring = booking.getRecurringBooking();
        if (recurring == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Este turno no es parte de un turno fijo");
        }
        return buildDetailDTO(recurring);
    }

    public RecurringBookingDetailDTO getRecurringBookingById(Long recurringId, Long requesterId, Role role) {
        RecurringBooking recurring = recurringBookingRepository.findById(recurringId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Turno fijo no encontrado"));
        if (role == Role.USER && !recurring.getClient().getId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "No tenés permiso para ver este turno fijo");
        }
        return buildDetailDTO(recurring);
    }

    private RecurringBookingDetailDTO buildDetailDTO(RecurringBooking recurring) {
        Space space = recurring.getSpace();
        LocalTime endTime = recurring.getStartTime()
                .plusMinutes(space.getSlotDuration() * recurring.getSlots());
        return RecurringBookingDetailDTO.builder()
                .recurringBookingId(recurring.getId())
                .clientName(recurring.getClient().getName())
                .clientEmail(recurring.getClient().getEmail())
                .spaceName(space.getName())
                .spaceType(space.getType())
                .dayOfWeek(recurring.getDayOfWeek())
                .startTime(recurring.getStartTime())
                .endTime(endTime)
                .startDate(recurring.getStartDate())
                .endDate(recurring.getEndDate())
                .intervalWeeks(recurring.getIntervalWeeks())
                .cancellationCount(recurring.getCancellationCount())
                .status(recurring.getStatus())
                .cancelledByName(recurring.getCancelledBy() != null
                        ? recurring.getCancelledBy().getName() : null)
                .cancelledAt(recurring.getCancelledAt())
                .build();
    }
}