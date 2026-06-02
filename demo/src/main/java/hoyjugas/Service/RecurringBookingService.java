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
            PricingService pricingService,PaymentRepository paymentRepository,MercadoPagoService mercadoPagoService) {
        super(bookingNotificationRepository, systemConfigRepository,userRepository,spaceRepository,paymentRepository,bookingRepository,mercadoPagoService);
        this.recurringBookingRepository = recurringBookingRepository;
        this.bookingRepository = bookingRepository;
        this.spaceRepository = spaceRepository;
        this.userRepository = userRepository;
        this.pricingService = pricingService;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public RecurringBookingResponseDTO createRecurringBooking(RecurringBookingRequestDTO dto,User employee) {
        User client = getClientOrThrow(dto.getClientId());
        Space space = getActiveSpaceOrThrow(dto.getSpaceId());
        SystemConfig config = getSystemConfig();
        LocalDate endDate = dto.getEndDate() != null
                ? dto.getEndDate()
                : LocalDate.of(LocalDate.now().getYear(), 12, 31);
        boolean alreadyExists = recurringBookingRepository.existsActiveRecurring(
                client.getId(),
                space.getId(),
                pricingService.resolveDayType(dto.getStartDate().getDayOfWeek()),
                dto.getStartTime(),
                RecurringStatus.ACTIVO
        );
        if (alreadyExists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un turno fijo activo para ese cliente, espacio y horario");
        }
        RecurringBooking recurring = new RecurringBooking();
        recurring.setClient(client);
        recurring.setSpace(space);
        recurring.setDayOfWeek(pricingService.resolveDayType(dto.getStartDate().getDayOfWeek()));
        recurring.setStartTime(dto.getStartTime());
        recurring.setStartDate(dto.getStartDate());
        recurring.setEndDate(endDate);
        recurring.setIntervalWeeks(
                dto.getIntervalWeeks() != null ? dto.getIntervalWeeks() : 1
        );
        recurring.setStatus(RecurringStatus.ACTIVO);
        RecurringBooking saved = recurringBookingRepository.save(recurring);
        List<Booking> bookingsGenerated = generateBookings(saved, space);
        bookingRepository.saveAll(bookingsGenerated);
        assignBookingNumbers(bookingsGenerated);
        if (!bookingsGenerated.isEmpty()) {
            Booking firstBooking = bookingsGenerated.get(0);
            BigDecimal minimumDeposit = calculateRecurringDeposit(
                    firstBooking.getTotalAmount(), space, config);

            if (dto.getDepositAmount().compareTo(minimumDeposit) < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "El monto mínimo de seña es $" + minimumDeposit);
            }
            if (dto.getDepositAmount().compareTo(firstBooking.getTotalAmount()) > 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "El monto no puede ser mayor al total del valor del turno");
            }

            PaymentType paymentType = dto.getDepositAmount().compareTo(firstBooking.getTotalAmount()) == 0
                    ? PaymentType.PAGO_TOTAL
                    : PaymentType.SEÑA;
            Payment deposit = buildPayment(
                    firstBooking, dto.getPaymentMethod(), dto.getDepositAmount(),
                    dto.getTransactionId(), employee, paymentType);
            paymentRepository.save(deposit);
            firstBooking.setPaymentStatus(
                    calculatePaymentStatus(firstBooking.getId(), firstBooking.getTotalAmount()));
            bookingRepository.save(firstBooking);
        }
        RecurringBookingResponseDTO response = RecurringBookingResponseDTO
                .fromEntity(saved, bookingsGenerated);
        response.setDepositLabel(String.format(
                "Las primeras %d veces la seña es el doble del valor normal",
                config.getRecurringInitialDepositTurns()
        ));
        response.setSlots(
                buildSlots(bookingsGenerated, config.getRecurringInitialDepositTurns())
        );
        return response;
    }

    protected BigDecimal calculateRecurringDeposit(BigDecimal totalPrice,Space space,SystemConfig config) {
        BigDecimal deposit = space.getDepositValue();
        if (1 <= config.getRecurringInitialDepositTurns()) {
            deposit = deposit.multiply(
                    config.getRecurringDepositMultiplier()
            );
        }
        return deposit.min(totalPrice);
    }

    private List<Booking> generateBookings(RecurringBooking recurring, Space space) {
        List<Booking> bookings = new ArrayList<>();
        LocalDate current = recurring.getStartDate();
        int bookingNumber = 1;
        while (!current.isAfter(recurring.getEndDate())) {
            LocalDateTime startDatetime = LocalDateTime.of(current, recurring.getStartTime());
            LocalDateTime endDatetime = startDatetime.plusMinutes(space.getSlotDuration());
            boolean ocupado = bookingRepository.existsOverlappingBooking(
                    space.getId(),
                    startDatetime,
                    endDatetime,
                    BookingStatus.CANCELADO
            );
            if (!ocupado) {
                BigDecimal price = pricingService.getPriceForSlot(space, startDatetime);
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
                bookingNumber++;
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
        BigDecimal firstDeposit = calculateRecurringDeposit(price,space, config);

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
        if (!booking.getClient().getId().equals(dto.getRequesterId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "El cliente no pertenece a ese turno");
        }
        if(!booking.isRecurring()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El turno debe pertenecer a un ciclo de turnos fijo");
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

    public Page<RecurringBookingResponseDTO> getRecurringByClient(
            Long requesterId, RecurringBookingFilterRequestDTO dto) {

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
                    dto.getPaymentType(),
                    dto.getPaymentStatus());
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
                            PaymentType.SEÑA,
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

            slots.add(RecurringBookingSlotDTO.fromEntity(
                    booking,
                    turnNumber,
                    turnsWithDoubleDeposit,
                    depositPaid,
                    remaining
            ));
            turnNumber++;
        }
        return slots;
    }

}