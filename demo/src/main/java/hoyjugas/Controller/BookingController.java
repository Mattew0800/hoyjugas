package hoyjugas.Controller;

import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import hoyjugas.Config.UserDetailsImpl;
import hoyjugas.DTO.Booking.*;
import hoyjugas.DTO.Booking.BookingDetailRequestDTO;
import hoyjugas.DTO.Payment.CompleteBookingPaymentDTO;
import hoyjugas.DTO.Payment.ProcessRefundRequestDTO;
import hoyjugas.DTO.User.ClientIdRequestDTO;
import hoyjugas.Model.User;
import hoyjugas.Service.BookingService;
import hoyjugas.Service.MercadoPagoService;
import hoyjugas.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;
    private final MercadoPagoService mercadoPagoService;

    @PostMapping("/availability")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<SpaceAvailabilityDTO>> getAvailability(@Valid @RequestBody AvailabilityRequestDTO dto) {
        return ResponseEntity.ok(bookingService.getAvailability(dto.getSpaceId(), dto.getDate()));
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<BookingResponseDTO> createBookingByEmployee(@Valid @RequestBody EmployeeBookingRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBookingByEmployee(dto, userService.validateEmployeePin(dto.getEmployeePin())));
    }

    @PostMapping("/public/create")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BookingCreatedResponseDTO> createBookingByClient(@Valid @RequestBody ClientBookingRequestDTO dto,@AuthenticationPrincipal UserDetailsImpl client) throws MPException, MPApiException {
        User user = userService.getClientById(client.getId());
        BookingResponseDTO booking = bookingService.createBookingByClient(dto, user);
        try{
            String mpUrl = mercadoPagoService.createPreference(
                    bookingService.getBookingEntity(booking.getId()),
                    dto.getDepositAmount()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new BookingCreatedResponseDTO(booking, mpUrl));
        }catch (Exception e) {
            bookingService.markAsPaymentError(booking.getId());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error al procesar el pago. Por favor intentá de nuevo.");
        }
    }

    @PostMapping("/detail")
    public ResponseEntity<BookingResponseDTO> getBooking(@Valid @RequestBody BookingDetailRequestDTO dto) {
        return ResponseEntity.ok(bookingService.getBooking(dto.getBookingId()));
    }

    @PostMapping("/complete")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<BookingResponseDTO> completeBooking(@Valid @RequestBody CompleteBookingPaymentDTO dto) {
        return ResponseEntity.ok(bookingService.completeBooking(dto.getBookingId(), dto, userService.validateEmployeePin(dto.getEmployeePin())));
    }

    @PostMapping("/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BookingResponseDTO> cancelBooking(@Valid @RequestBody CancelBookingRequestDTO dto){
        User employee = null;
        if (dto.getEmployeePin() != null) {
            employee=userService.validateEmployeePin(dto.getEmployeePin());
        }
        return ResponseEntity.ok(bookingService.cancelBooking(dto,employee));
    }

    @PostMapping("/list")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<Page<BookingListDTO>> getBookings(@Valid @RequestBody BookingFilterRequestDTO dto) {
        Pageable pageable = PageRequest.of(dto.getPage(),dto.getSize(),Sort.by(Sort.Direction.fromString(dto.getSortDirection()), dto.getSortBy())
        );
        return ResponseEntity.ok(bookingService.getBookings(
                dto.getClientId(),
                dto.getSpaceId(),
                dto.getStatus(),
                dto.getEmployeeId(),
                dto.getDateFrom(),
                dto.getDateTo(),
                pageable
        ));
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<BookingListDTO>> getMyBookings(@Valid @RequestBody BookingFilterRequestDTO dto,@AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.ok(bookingService.getBookings(
                me.getId(),
                dto.getSpaceId(),
                dto.getStatus(),
                null,
                dto.getDateFrom(),
                dto.getDateTo(),
                PageRequest.of(dto.getPage(), dto.getSize(),
                        Sort.by(Sort.Direction.fromString(dto.getSortDirection()), dto.getSortBy()))
        ));
    }
//    @PostMapping("/process-refund")
//    @PreAuthorize("hasRole('EMPLOYEE')")
//    public ResponseEntity<BookingResponseDTO> processRefund(
//            @Valid @RequestBody ProcessRefundRequestDTO dto) {
//        User employee = userService.validateEmployeePin(dto.getEmployeePin());
//        return ResponseEntity.ok(bookingService.processRefund(dto.getBookingId(), dto, employee));
//    }


//    @PostMapping("/client-debt")
//    @PreAuthorize("hasRole('USER')")
//    public ResponseEntity<BigDecimal> getClientDebt(@Valid @RequestBody ClientIdRequestDTO dto,@AuthenticationPrincipal UserDetailsImpl me) {
//        return ResponseEntity.ok(bookingService.getClientDebt(dto.getClientId(),me.getId()));
//    }

    @PostMapping("/reschedule")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BookingResponseDTO> rescheduleBooking(@Valid @RequestBody RescheduleBookingRequestDTO dto) {
        User employee = null;
        if (dto.getEmployeePin() != null) {
            employee = userService.validateEmployeePin(dto.getEmployeePin());
        }
        return ResponseEntity.ok(bookingService.rescheduleBooking(dto, employee));
    }

}