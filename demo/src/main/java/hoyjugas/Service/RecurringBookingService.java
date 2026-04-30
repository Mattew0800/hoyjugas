package hoyjugas.Service;

import hoyjugas.DTO.Booking.CancelBookingRequestDTO;
import hoyjugas.DTO.RecurringBooking.RecurringBookingRequestDTO;
import hoyjugas.DTO.RecurringBooking.RecurringBookingResponseDTO;
import hoyjugas.DTO.RecurringBooking.RecurringBookingSlotDTO;
import hoyjugas.DTO.RecurringBooking.RecurringCancelResponseDTO;
import hoyjugas.Enum.*;
import hoyjugas.Model.*;
import hoyjugas.Repository.*;
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
            PricingService pricingService,PaymentRepository paymentRepository) {
        super(bookingNotificationRepository, systemConfigRepository,userRepository,spaceRepository,paymentRepository);
        this.recurringBookingRepository = recurringBookingRepository;
        this.bookingRepository = bookingRepository;
        this.spaceRepository = spaceRepository;
        this.userRepository = userRepository;
        this.pricingService = pricingService;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public RecurringBookingResponseDTO createRecurringBooking(
            RecurringBookingRequestDTO dto,
            User employee
    ) {
        User client = getClientOrThrow(dto.getClientId());
        Space space = getActiveSpaceOrThrow(dto.getSpaceId());
        SystemConfig config = getSystemConfig();

        LocalDate endDate = dto.getEndDate() != null
                ? dto.getEndDate()
                : LocalDate.of(LocalDate.now().getYear(), 12, 31);

        RecurringBooking recurring = new RecurringBooking();
        recurring.setClient(client);
        recurring.setSpace(space);
        recurring.setDayOfWeek(dto.getStartDate().getDayOfWeek());
        recurring.setStartTime(dto.getStartTime());
        recurring.setStartDate(dto.getStartDate());
        recurring.setEndDate(endDate);
        recurring.setIntervalWeeks(
                dto.getIntervalWeeks() != null ? dto.getIntervalWeeks() : 1
        );
        recurring.setStatus(RecurringStatus.ACTIVO);

        RecurringBooking saved = recurringBookingRepository.save(recurring);
        List<Booking> bookingsGenerados = generateBookings(saved, space, config);
        bookingRepository.saveAll(bookingsGenerados);

        if (!bookingsGenerados.isEmpty()) {
            Booking firstBooking = bookingsGenerados.get(0);

            BigDecimal depositAmount = calculateDeposit(1, firstBooking.getTotalAmount(), config);

            Payment seña = buildPayment(
                    firstBooking,
                    dto.getPaymentMethod(),
                    depositAmount,
                    dto.getTransactionId(),
                    employee,
                    PaymentType.DEPOSITO
            );
            paymentRepository.save(seña);
            firstBooking.setPaymentStatus(
                    calculatePaymentStatus(firstBooking.getId(), firstBooking.getTotalAmount())
            );
            bookingRepository.save(firstBooking);
        }
        RecurringBookingResponseDTO response = RecurringBookingResponseDTO
                .fromEntity(saved, bookingsGenerados);
        response.setDepositLabel(String.format(
                "Las primeras %d veces la seña es el doble del valor normal",
                config.getRecurringInitialDepositTurns()
        ));
        response.setSlots(
                buildSlots(bookingsGenerados, config.getRecurringInitialDepositTurns())
        );
        return response;
    }

    private List<Booking> generateBookings(RecurringBooking recurring, Space space, SystemConfig config) {
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
                BigDecimal deposit = calculateDeposit(bookingNumber, price, config);

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

    private BigDecimal calculateDeposit(int bookingNumber, BigDecimal totalPrice, SystemConfig config) {
        int bookingsWithHighDeposit = config.getRecurringInitialDepositTurns();
        BigDecimal initialDepositFactor = config.getRecurringInitialDepositFactor();
        BigDecimal normalDepositFactor = config.getRecurringDepositFactor();

        BigDecimal factor = bookingNumber <= bookingsWithHighDeposit
                ? initialDepositFactor
                : normalDepositFactor;
        BigDecimal deposit = totalPrice.multiply(factor);
        return deposit.min(totalPrice);
    }


    @Transactional
    public RecurringCancelResponseDTO cancelOneBooking(Long bookingId, CancelBookingRequestDTO dto) {
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
    public void cancelRecurringCycle(Long recurringId, CancelBookingRequestDTO dto) {
        RecurringBooking recurring = recurringBookingRepository.findById(recurringId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ciclo no encontrado"));

        if (recurring.getStatus().equals(RecurringStatus.CANCELADO)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El ciclo ya está cancelado");
        }

        cancelFutureBookings(recurring, dto.getCancellationReason());
        recurring.setStatus(RecurringStatus.CANCELADO);
        recurringBookingRepository.save(recurring);
    }

    public List<RecurringBookingResponseDTO> getRecurringByClient(Long clientId) {
        return recurringBookingRepository
                .findByClientIdOrderByStartDateDesc(clientId)
                .stream()
                .map(r -> RecurringBookingResponseDTO.fromEntity(r, r.getBookings()))
                .toList();
    }

    private List<RecurringBookingSlotDTO> buildSlots(
            List<Booking> bookings,
            int turnosConSeñaDoble
    ) {
        List<RecurringBookingSlotDTO> slots = new ArrayList<>();
        int turnoNumero = 1;

        for (Booking booking : bookings) {
            BigDecimal depositPaid = paymentRepository
                    .findTotalByBookingIdAndType(
                            booking.getId(),
                            PaymentType.DEPOSITO,
                            PaymentStatus.PAGADO
                    ).orElse(BigDecimal.ZERO);


            BigDecimal totalCobrado = paymentRepository
                    .findTotalByBookingIdExcludingType(
                            booking.getId(),
                            PaymentType.DEVOLUCION,
                            PaymentStatus.PAGADO
                    ).orElse(BigDecimal.ZERO);

            BigDecimal remaining = booking.getTotalAmount()
                    .subtract(totalCobrado)
                    .max(BigDecimal.ZERO);

            booking.setPaymentStatus(
                    calculatePaymentStatus(booking.getId(), booking.getTotalAmount())
            );

            slots.add(RecurringBookingSlotDTO.fromEntity(
                    booking,
                    turnoNumero,
                    turnosConSeñaDoble,
                    depositPaid,
                    remaining
            ));

            turnoNumero++;
        }

        return slots;
    }

}