package com.eventmgmt.controller;

import com.eventmgmt.dto.BookingRequest;
import com.eventmgmt.dto.PaymentRequest;
import com.eventmgmt.model.Booking;
import com.eventmgmt.model.Payment;
import com.eventmgmt.model.User;
import com.eventmgmt.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Booking> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(bookingService.createBooking(request, user));
    }

    @PostMapping("/payment")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Payment> processPayment(
            @Valid @RequestBody PaymentRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(bookingService.processPayment(request, user));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        try {
            return ResponseEntity.ok(bookingService.cancelBooking(id, user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).build();
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Booking>> getMyBookings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.getUserBookings(user.getId()));
    }

    @GetMapping("/organizer")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<List<Booking>> getOrganizerBookings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.getOrganizerBookings(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        try {
            return ResponseEntity.ok(bookingService.getBookingById(id, user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).build();
        }
    }

    @GetMapping("/{id}/payment")
    public ResponseEntity<Payment> getPaymentByBookingId(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        try {
            // Check authorization by retrieving booking details first
            bookingService.getBookingById(id, user);
            return ResponseEntity.ok(bookingService.getPaymentByBookingId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).build();
        }
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Booking>> createBulkBookings(
            @Valid @RequestBody List<BookingRequest> requests,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(bookingService.createBulkBookings(requests, user));
    }

    @PostMapping("/payment/bulk")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Payment>> processBulkPayments(
            @Valid @RequestBody List<PaymentRequest> requests,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(bookingService.processBulkPayments(requests, user));
    }

    @PostMapping("/{id}/checkin")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<Booking> checkInBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        try {
            return ResponseEntity.ok(bookingService.checkInBooking(id, user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
