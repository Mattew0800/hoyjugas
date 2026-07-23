package hoyjugas.Service;

import hoyjugas.DTO.Booking.*;
import hoyjugas.DTO.Payment.PaymentRequestDTO;
import hoyjugas.DTO.Payment.ProcessRefundRequestDTO;
import hoyjugas.DTO.Booking.RescheduleBookingRequestDTO;
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
import java.time.temporal.TemporalAmount;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;

import javax.swing.text.html.Option;

import static java.util.Calendar.HOUR;

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
            PricingService pricingService,SpaceScheduleRepository spaceScheduleRepository,PaymentRepository paymentRepository,MercadoPagoService mercadoPagoService) {
        super(bookingNotificationRepository, systemConfigRepository,userRepository,spaceRepository,paymentRepository,bookingRepository,mercadoPagoService);
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
        int slots = dto.getSlots() != null ? dto.getSlots() : 1;
        LocalDateTime endDatetime = dto.getStartDatetime()
                .plusMinutes(space.getSlotDuration() * slots);
        validateAvailability(space.getId(), dto.getStartDatetime(), endDatetime);
        if (dto.getPaymentType() != PaymentType.PAGO_TOTAL && dto.getPaymentType() != PaymentType.SEÑA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tipo de pago no soportado.");
        }
        BigDecimal totalPrice = pricingService.getPriceForSlot(space, dto.getStartDatetime())
                .multiply(BigDecimal.valueOf(dto.getSlots()));
        if (dto.getPaymentType() == PaymentType.SEÑA &&
                space.getDepositValue().compareTo(totalPrice) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"La seña no puede superar el monto total");
        }
        Booking booking = buildBooking(client, space, dto.getStartDatetime(), endDatetime, totalPrice);
        booking.setTermsAccepted(dto.getTermsAccepted());
        booking.setTermsAcceptedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);
        saved = assignBookingNumber(saved);
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

        BigDecimal price =
                pricingService.getPriceForSlot(space, dto.getStartDatetime());

        BigDecimal minimumDeposit =
                calculateDeposit(space, price);

        BigDecimal depositAmount = getDepositAmount(dto, minimumDeposit, price);

        Booking booking = buildBooking(client, space, dto.getStartDatetime(), endDatetime, price);
        booking.setCreatedBy(employee);
        booking.setTermsAccepted(dto.getTermsAccepted());
        booking.setTermsAcceptedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);
        assignBookingNumber(saved);
        bookingRepository.save(saved);
        scheduleReminder(saved);
        return buildBookingResponseDTO(saved);
    }

    private static BigDecimal getDepositAmount(EmployeeBookingRequestDTO dto, BigDecimal minimumDeposit, BigDecimal price) {
        BigDecimal depositAmount = dto.getDepositAmount() != null
                ? dto.getDepositAmount()
                : minimumDeposit;
        if (depositAmount.compareTo(minimumDeposit) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La seña no puede ser menor a " + minimumDeposit
            );
        }
        if (depositAmount.compareTo(price) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La seña no puede superar el total"
            );
        }
        return depositAmount;
    }

    private PaymentStatus determinePaymentStatus(BigDecimal paidAmount, BigDecimal totalPrice) {
        if (paidAmount.compareTo(totalPrice) == 0) {
            return PaymentStatus.PAGADO;
        } else if (paidAmount.compareTo(BigDecimal.ZERO) > 0) {
            return PaymentStatus.RESERVADO;
        }
        return PaymentStatus.NO_PAGADO;
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
    public BookingResponseDTO cancelBooking(CancelBookingRequestDTO dto, User employee) {
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
                Payment refund = buildPayment(
                        booking,
                        null,
                        totalCollected,
                        null,
                        employee,
                        PaymentType.DEVOLUCION
                );
                refund.setStatus(PaymentStatus.PENDIENTE);
                paymentRepository.save(refund);
                booking.setRefunded(false);
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


    public Page<BookingListDTO> getBookings(Long clientId, Long spaceId, BookingStatus status,
                                            Long employeeId, LocalDateTime dateFrom, LocalDateTime dateTo, Pageable pageable) {
        return bookingRepository
                .findAllWithFilters(clientId, spaceId, status, employeeId, dateFrom, dateTo, pageable)
                .map(booking -> {
                    BookingListDTO dto = BookingListDTO.fromEntity(booking);

                    BigDecimal totalCobrado = paymentRepository.findTotalByBookingIdExcludingType(
                            booking.getId(), PaymentType.DEVOLUCION, PaymentStatus.PAGADO);
                    dto.setRemainingAmount(booking.getTotalAmount()
                            .subtract(totalCobrado).max(BigDecimal.ZERO));

                    paymentRepository.findFirstByBookingIdAndTypeOrderByCreatedAtDesc(
                                    booking.getId(), PaymentType.PAGO_TOTAL)
                            .ifPresent(p -> {
                                if (p.getCollectedBy() != null) {
                                    dto.setPaymentCollectedByName(p.getCollectedBy().getName());
                                }
                            });

                    return dto;
                });
    }

    public BookingResponseDTO getBooking(Long bookingId) {
        return buildBookingResponseDTO(getBookingOrThrow(bookingId));
    }

    public BigDecimal getClientDebt(Long clientId,Long requesterId) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (requester.getRole().equals(Role.USER) && !requesterId.equals(clientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tenés permiso para ver la deuda de otro cliente");
        }
        return bookingRepository.findDebtByClientId(
                clientId,
                PaymentStatus.NO_PAGADO,
                BookingStatus.FINALIZADO,
                PaymentStatus.PAGADO,
                PaymentType.DEVOLUCION
        );
    }

    public List<BookingListDTO> getClientHistory(Long clientId,Long requesterId) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (requester.getRole().equals(Role.USER) && !requesterId.equals(clientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tenés permiso para ver el historial de otro cliente");
        }
        return bookingRepository
                .findByClientIdOrderByStartDatetimeDesc(clientId)
                .stream()
                .map(BookingListDTO::fromEntity)
                .toList();
    }

    @Transactional
    public BookingResponseDTO processRefund(Long bookingId, ProcessRefundRequestDTO dto, User employee) {
        Booking booking = getBookingOrThrow(bookingId);

        if (!booking.getBookingStatus().equals(BookingStatus.CANCELADO)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El turno no está cancelado");
        }

        if (booking.getRefunded()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La devolución ya fue procesada");
        }

        Payment refund = paymentRepository
                .findByBookingIdAndTypeAndStatus(bookingId, PaymentType.DEVOLUCION, PaymentStatus.PENDIENTE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No hay devolución pendiente"));

        refund.setMethod(dto.getPaymentMethod());
        refund.setCollectedBy(employee);
        refund.setStatus(PaymentStatus.PAGADO);
        refund.setTransactionId(dto.getTransactionId());
        paymentRepository.save(refund);

        booking.setRefunded(true);
        bookingRepository.save(booking);

        return buildBookingResponseDTO(booking);
    }

    private Booking getBookingOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Turno no encontrado"));
    }

    private Optional<Payment> findLastCollector(Long bookingId) {
        return paymentRepository.findFirstByBookingIdAndTypeOrderByCreatedAtDesc(
                bookingId, PaymentType.PAGO_TOTAL
        );
    }

    @Transactional
    public BookingResponseDTO rescheduleBooking(RescheduleBookingRequestDTO dto, User employee) {
        Booking original = getBookingOrThrow(dto.getOriginalBookingId());

        if (original.getBookingStatus().equals(BookingStatus.FINALIZADO)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No se puede reprogramar un turno finalizado");
        }
        if (original.getBookingStatus().equals(BookingStatus.CANCELADO)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El turno ya está cancelado");
        }
        if (original.isRecurring()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No se puede reprogramar un turno fijo");
        }
        SystemConfig config = getSystemConfig();
        long hoursTillBooking = ChronoUnit.HOURS.between(LocalDateTime.now(), original.getStartDatetime());
        if (hoursTillBooking < config.getCancellationHoursLimit()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("No se puede reprogramar con menos de %d horas de anticipación",
                            config.getCancellationHoursLimit()));
        }
        Space space = getActiveSpaceOrThrow(dto.getSpaceId());
        LocalDateTime endDatetime = dto.getStartDatetime().plusMinutes(space.getSlotDuration());
        validateAvailability(space.getId(), dto.getStartDatetime(), endDatetime);
        BigDecimal newPrice = pricingService.getPriceForSlot(space, dto.getStartDatetime());
        original.setBookingStatus(BookingStatus.CANCELADO);
        original.setCancelledAt(LocalDateTime.now());
        original.setCancellationReason(dto.getCancellationReason() != null
                ? dto.getCancellationReason()
                : "Reprogramado");
        original.setRefunded(false);
        bookingRepository.save(original);
        BigDecimal alreadyPaid = paymentRepository.findTotalByBookingIdExcludingType(
                original.getId(),
                PaymentType.DEVOLUCION,
                PaymentStatus.PAGADO
        );

        Booking newBooking = buildBooking(
                original.getClient(),
                space,
                dto.getStartDatetime(),
                endDatetime,
                newPrice
        );
        newBooking.setRescheduledFrom(original);
        newBooking.setCreatedBy(employee);
        newBooking.setTermsAccepted(dto.getTermsAccepted());
        newBooking.setTermsAcceptedAt(LocalDateTime.now());
        newBooking.setBookingStatus(BookingStatus.CONFIRMADO);
        Booking saved = bookingRepository.save(newBooking);
        saved.setBookingNumber(String.format("%06d", saved.getId()));
        paymentRepository.save(buildTransferPayment(original,newBooking,alreadyPaid,employee));
        saved.setPaymentStatus(calculatePaymentStatus(saved.getId(), newPrice));
        bookingRepository.save(saved);
        scheduleReminder(saved);
        scheduleNotification(saved, NotificationType.CANCELACION);
        return buildBookingResponseDTO(saved);
    }

    public Booking getBookingEntity(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Turno no encontrado"));
    }

    public void markAsPaymentError(Long bookingId){
        Booking booking = getBookingOrThrow(bookingId);
        booking.setBookingStatus(BookingStatus.ERROR_DE_PAGO);
    }
}