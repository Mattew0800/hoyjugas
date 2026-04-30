package hoyjugas.Controller;

import hoyjugas.Config.UserDetailsImpl;
import hoyjugas.DTO.Booking.*;
import hoyjugas.DTO.Booking.BookingDetailRequestDTO;
import hoyjugas.DTO.Payment.CompleteBookingPaymentDTO;
import hoyjugas.DTO.User.ClientIdRequestDTO;
import hoyjugas.Model.User;
import hoyjugas.Service.BookingService;
import hoyjugas.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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

    @PostMapping("/availability")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<SpaceAvailabilityDTO>> getAvailability(@Valid @RequestBody AvailabilityRequestDTO dto
    ) {
        return ResponseEntity.ok(bookingService.getAvailability(dto.getSpaceId(), dto.getDate()));
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<BookingResponseDTO> createBookingByEmployee(@Valid @RequestBody EmployeeBookingRequestDTO dto,@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBookingByEmployee(dto, userService.validateEmployeePin(dto.getEmployeePin())));
    }

    @PostMapping("/public/create")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BookingResponseDTO> createBookingByClient(@Valid @RequestBody ClientBookingRequestDTO dto,@AuthenticationPrincipal UserDetailsImpl client) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBookingByClient(dto,userService.getClientById(client.getId())));
    }

    @PostMapping("/detail")
    public ResponseEntity<BookingResponseDTO> getBooking(@Valid @RequestBody BookingDetailRequestDTO dto) {
        return ResponseEntity.ok(bookingService.getBooking(dto.getBookingId()));
    }

    @PostMapping("/complete")

    public ResponseEntity<BookingResponseDTO> completeBooking(@Valid @RequestBody CompleteBookingPaymentDTO dto,@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(bookingService.completeBooking(dto.getBookingId(), dto, userService.validateEmployeePin(dto.getEmployeePin())));
    }

    @PostMapping("/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(@Valid @RequestBody CancelBookingRequestDTO dto){
        return ResponseEntity.ok(bookingService.cancelBooking(dto));
    }

    @PostMapping("/list")
    public ResponseEntity<Page<BookingListDTO>> getBookings(
            @Valid @RequestBody BookingFilterRequestDTO dto,
            Pageable pageable
    ) {
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

    @PostMapping("/client-history")
    public ResponseEntity<List<BookingListDTO>> getClientHistory(@Valid @RequestBody ClientIdRequestDTO dto) {
        return ResponseEntity.ok(bookingService.getClientHistory(dto.getClientId()));
    }

    @PostMapping("/client-debt")
    public ResponseEntity<BigDecimal> getClientDebt(@Valid @RequestBody ClientIdRequestDTO dto) {
        return ResponseEntity.ok(bookingService.getClientDebt(dto.getClientId()));
    }
}