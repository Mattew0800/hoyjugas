package hoyjugas.Service;

import hoyjugas.DTO.Booking.*;
import hoyjugas.DTO.Payment.PaymentRequestDTO;
import hoyjugas.Enum.*;
import hoyjugas.Model.*;
import hoyjugas.Repository.*;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Pageable;

@Service
public class BookingService extends BaseBookingService {

    private final BookingRepository bookingRepository;
    private final SpaceRepository spaceRepository;
    private final UserRepository userRepository;
    private final PricingService pricingService;
    private final SpaceScheduleRepository spaceScheduleRepository;
    private final PaymentRepository paymentRepository;

    public BookingService(
            BookingNotificationRepository bookingNotificationRepository,
            SystemConfigRepository systemConfigRepository,
            BookingRepository bookingRepository,
            SpaceRepository spaceRepository,
            UserRepository userRepository,
            PricingService pricingService,SpaceScheduleRepository spaceScheduleRepository,PaymentRepository paymentRepository) {
        super(bookingNotificationRepository, systemConfigRepository,userRepository,spaceRepository,paymentRepository);
        this.bookingRepository = bookingRepository;
        this.spaceRepository = spaceRepository;
        this.userRepository = userRepository;
        this.pricingService = pricingService;
        this.spaceScheduleRepository=spaceScheduleRepository;
        this.paymentRepository=paymentRepository;
    }


    public List<SpaceAvailabilityDTO> getAvailability(Long spaceId, LocalDate date) {
        Space space = spaceRepository.findByIdAndIsActiveTrue(spaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado"));
        DayType dayType = pricingService.resolveDayType(date.getDayOfWeek());

        SpaceSchedule schedule = spaceScheduleRepository
                .findBySpaceIdAndDayType(spaceId, dayType)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No hay horario configurado para ese espacio y día"
                ));

        LocalDateTime startOfDay = date.atTime(schedule.getOpeningTime());
        LocalDateTime endOfDay = date.atTime(schedule.getClosingTime());
        List<Booking> ocuppiedBookings = bookingRepository.findBySpaceAndDate(
                spaceId,
                date.atStartOfDay(),
                date.plusDays(1).atStartOfDay(),
                BookingStatus.CANCELADO
        );

        List<SpaceAvailabilityDTO> slots = new ArrayList<>();
        LocalDateTime current = startOfDay;

        while (current.isBefore(endOfDay)) {
            LocalDateTime slotEnd = current.plusMinutes(space.getSlotDuration());
            final LocalDateTime slotStart = current;

            boolean ocuppied = ocuppiedBookings.stream().anyMatch(b ->
                    b.getStartDatetime().isBefore(slotEnd) &&
                            b.getEndDatetime().isAfter(slotStart)
            );

            BigDecimal price = pricingService.getPriceForSlot(space, slotStart);
            SpaceAvailabilityDTO slot = new SpaceAvailabilityDTO();
            slot.setSpaceId(space.getId());
            slot.setSpaceName(space.getName());
            slot.setSpaceType(space.getType().name());
            slot.setStartDatetime(slotStart);
            slot.setEndDatetime(slotEnd);
            slot.setPrice(price);
            slot.setAvailable(!ocuppied);
            slots.add(slot);
            current = slotEnd;
        }
        return slots;
    }

    @Transactional
    public BookingResponseDTO createBookingByClient(ClientBookingRequestDTO dto, User client) {
        Space space = getActiveSpaceOrThrow(dto.getSpaceId());
        LocalDateTime endDatetime = dto.getStartDatetime().plusMinutes(space.getSlotDuration());

        validateAvailability(space.getId(), dto.getStartDatetime(), endDatetime);

        BigDecimal price = pricingService.getPriceForSlot(space, dto.getStartDatetime());
        BigDecimal depositAmount = calculateDeposit(space, price);

        Booking booking = buildBooking(client, space, dto.getStartDatetime(), endDatetime, price);
        booking.setTermsAccepted(dto.getTermsAccepted());
        booking.setTermsAcceptedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        saved.setBookingNumber(String.format("%06d", saved.getId()));
        bookingRepository.save(saved);

        // Pago con seña calculada por el sistema
        Payment deposit = buildPayment(saved, dto.getPaymentMethod(), depositAmount,
                null, null, PaymentType.DEPOSITO);
        deposit.setStatus(PaymentStatus.PENDIENTE);  // espera confirmación de MP
        paymentRepository.save(deposit);

        saved.setPaymentStatus(calculatePaymentStatus(saved.getId(), price));
        bookingRepository.save(saved);

        scheduleReminder(saved);
        return buildBookingResponseDTO(saved);
    }

    @Transactional
    public BookingResponseDTO createBookingByEmployee(EmployeeBookingRequestDTO dto, User employee) {
        User client = getClientOrThrow(dto.getClientId());
        Space space = getActiveSpaceOrThrow(dto.getSpaceId());
        LocalDateTime endDatetime = dto.getStartDatetime().plusMinutes(space.getSlotDuration());

        validateAvailability(space.getId(), dto.getStartDatetime(), endDatetime);

        BigDecimal price = pricingService.getPriceForSlot(space, dto.getStartDatetime());
        BigDecimal depositAmount = dto.getDepositAmount() != null
                ? dto.getDepositAmount()
                : calculateDeposit(space, price);

        if (depositAmount.compareTo(price) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La seña no puede superar el total");
        }

        Booking booking = buildBooking(client, space, dto.getStartDatetime(), endDatetime, price);
        booking.setCreatedBy(employee);
        booking.setTermsAccepted(dto.getTermsAccepted());
        booking.setTermsAcceptedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        saved.setBookingNumber(String.format("%06d", saved.getId()));
        bookingRepository.save(saved);

        Payment deposit = buildPayment(saved, dto.getPaymentMethod(), depositAmount,
                dto.getTransactionId(), employee, PaymentType.DEPOSITO);
        paymentRepository.save(deposit);

        saved.setPaymentStatus(calculatePaymentStatus(saved.getId(), price));
        bookingRepository.save(saved);

        scheduleReminder(saved);
        return buildBookingResponseDTO(saved);
    }
    private Booking buildBooking(User client, Space space, LocalDateTime start,
                                 LocalDateTime end, BigDecimal price) {
        Booking booking = new Booking();
        booking.setClient(client);
        booking.setSpace(space);
        booking.setStartDatetime(start);
        booking.setEndDatetime(end);
        booking.setTotalAmount(price);
        booking.setBookingStatus(BookingStatus.CONFIRMADO);
        booking.setPaymentStatus(PaymentStatus.NO_PAGADO);
        return booking;
    }

    private void validateAvailability(Long spaceId, LocalDateTime start, LocalDateTime end) {
        boolean overlaps = bookingRepository.existsOverlappingBooking(
                spaceId, start, end, BookingStatus.CANCELADO);
        if (overlaps) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El espacio ya está reservado en ese horario");
        }
    }

    @Transactional
    public BookingResponseDTO completeBooking(Long bookingId, PaymentRequestDTO dto, User employee) {
        Booking booking = getBookingOrThrow(bookingId);
        if (!booking.getBookingStatus().equals(BookingStatus.CONFIRMADO)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El turno no está confirmado");
        }
        BigDecimal leftAmount = bookingRepository.findRemainingAmount(bookingId);
        if (leftAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El turno ya está completamente pago");
        }
        if (dto.getAmount() != null && dto.getAmount().compareTo(leftAmount) != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El monto cobrado ($" + dto.getAmount() + ") no coincide con el saldo pendiente ($" + leftAmount + ")");
        }
        BigDecimal amountToPay = dto.getAmount() != null ? dto.getAmount() : leftAmount;
        Payment payment = buildPayment(
                booking,
                dto.getPaymentMethod(),
                amountToPay,
                dto.getTransactionId(),
                employee,
                PaymentType.PAGO_TOTAL
        );
        paymentRepository.save(payment);

        booking.setBookingStatus(BookingStatus.FINALIZADO);
        booking.setPaymentStatus(calculatePaymentStatus(bookingId, booking.getTotalAmount()));
        bookingRepository.save(booking);
        return buildBookingResponseDTO(booking);
    }

    @Transactional
    public BookingResponseDTO cancelBooking(CancelBookingRequestDTO dto) {
        Long bookingId = dto.getBookingId();
        Booking booking = getBookingOrThrow(bookingId);

        if (booking.getBookingStatus().equals(BookingStatus.FINALIZADO)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede cancelar un turno finalizado");
        }
        if (booking.getBookingStatus().equals(BookingStatus.CANCELADO)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El turno ya está cancelado");
        }
        if (booking.isRecurring()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Para cancelar un turno fijo usá el endpoint de cancelación de ciclo");
        }

        SystemConfig config = getSystemConfig();
        long hoursTillBooking = ChronoUnit.HOURS.between(LocalDateTime.now(), booking.getStartDatetime());
        boolean devolution = hoursTillBooking >= config.getCancellationHoursLimit();

        if (devolution) {
            BigDecimal totalCollected = paymentRepository.findTotalCobradoByBookingId(bookingId);

            if (totalCollected.compareTo(BigDecimal.ZERO) > 0) {
                PaymentMethod refundMethod = paymentRepository
                        .findFirstByBookingIdAndStatusOrderByCreatedAtAsc(bookingId, PaymentStatus.PAGADO)
                        .map(Payment::getMethod)
                        .orElse(PaymentMethod.EFECTIVO);

                Payment refund = buildPayment(
                        booking,
                        refundMethod,
                        totalCollected,
                        null,
                        null,
                        PaymentType.DEVOLUCION
                );
                refund.setStatus(PaymentStatus.PAGADO);
                paymentRepository.save(refund);
                booking.setRefunded(true);
            }
        }

        booking.setBookingStatus(BookingStatus.CANCELADO);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancellationReason(dto.getCancellationReason());
        booking.setPaymentStatus(calculatePaymentStatus(bookingId, booking.getTotalAmount()));

        bookingRepository.save(booking);
        scheduleNotification(booking, NotificationType.CANCELACION);

        return buildBookingResponseDTO(booking);
    }


    public Page<BookingListDTO> getBookings(
            Long clientId,
            Long spaceId,
            BookingStatus status,
            Long employeeId,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            Pageable pageable
    ) {
        return bookingRepository
                .findAllWithFilters(clientId, spaceId, status, employeeId, dateFrom, dateTo, pageable)
                .map(BookingListDTO::fromEntity);
    }


    public BookingResponseDTO getBooking(Long bookingId) {
        return buildBookingResponseDTO(getBookingOrThrow(bookingId));
    }

    public BigDecimal getClientDebt(Long clientId) {
        return bookingRepository.findDebtByClientId(
                clientId,
                PaymentStatus.NO_PAGADO,
                BookingStatus.FINALIZADO,
                PaymentStatus.PAGADO,
                PaymentType.DEVOLUCION
        );
    }

    public List<BookingListDTO> getClientHistory(Long clientId) {
        return bookingRepository
                .findByClientIdOrderByStartDatetimeDesc(clientId)
                .stream()
                .map(BookingListDTO::fromEntity)
                .toList();
    }

    private void scheduleReminder(Booking booking) {
        boolean yaExiste = bookingNotificationRepository
                .existsByBookingIdAndType(booking.getId(), NotificationType.RECUERDO_24H);

        if (!yaExiste) {
            SystemConfig config = getSystemConfig();
            BookingNotification notif = new BookingNotification();
            notif.setBooking(booking);
            notif.setType(NotificationType.RECUERDO_24H);
            notif.setStatus(NotificationStatus.PENDIENTE);
            notif.setHoursBefore(config.getReminderHoursBeforeBooking());
            bookingNotificationRepository.save(notif);
        }
    }


    private Booking getBookingOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Turno no encontrado"));
    }

}