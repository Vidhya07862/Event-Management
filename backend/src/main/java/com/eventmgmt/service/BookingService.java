package com.eventmgmt.service;

import com.eventmgmt.dto.BookingRequest;
import com.eventmgmt.dto.PaymentRequest;
import com.eventmgmt.model.*;
import com.eventmgmt.repository.BookingRepository;
import com.eventmgmt.repository.EventRepository;
import com.eventmgmt.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final PaymentRepository paymentRepository;

    public BookingService(
            BookingRepository bookingRepository,
            EventRepository eventRepository,
            PaymentRepository paymentRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public Booking createBooking(BookingRequest request, User user) {
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        if (!event.isApproved()) {
            throw new IllegalStateException("Cannot book tickets for an unapproved event");
        }

        // Create booking
        Booking booking = new Booking(
                null,
                user,
                event,
                request.ticketCount(),
                LocalDateTime.now(),
                "PENDING"
        );
        Booking savedBooking = bookingRepository.save(booking);

        // Create initial pending payment record
        double totalAmount = event.getPrice() * request.ticketCount();
        Payment payment = new Payment(
                null,
                savedBooking,
                totalAmount,
                "PENDING",
                null
        );
        paymentRepository.save(payment);

        return savedBooking;
    }

    @Transactional
    public Payment processPayment(PaymentRequest request, User user) {
        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        // Authorize: user must own the booking
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Not authorized to pay for this booking");
        }

        Payment payment = paymentRepository.findByBookingId(booking.getId())
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found for booking"));

        // Update payment and booking statuses (mocking payment processing success)
        payment.setPaymentStatus("SUCCESS");
        payment.setPaymentMethod(request.paymentMethod());
        paymentRepository.save(payment);

        booking.setStatus("CONFIRMED");
        bookingRepository.save(booking);

        return payment;
    }

    @Transactional
    public Booking cancelBooking(Long bookingId, User user) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        // Only user who booked or Admin can cancel
        if (!booking.getUser().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new IllegalStateException("Not authorized to cancel this booking");
        }

        booking.setStatus("CANCELLED");
        Booking savedBooking = bookingRepository.save(booking);

        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
        if (payment != null) {
            payment.setPaymentStatus("FAILED");
            paymentRepository.save(payment);
        }

        return savedBooking;
    }

    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getOrganizerBookings(Long organizerId) {
        return bookingRepository.findByEventOrganizerId(organizerId);
    }

    public Booking getBookingById(Long bookingId, User user) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        // Authorized if user is owner, organizer of the event, or Admin
        boolean isOwner = booking.getUser().getId().equals(user.getId());
        boolean isOrganizer = booking.getEvent().getOrganizer().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;

        if (!isOwner && !isOrganizer && !isAdmin) {
            throw new IllegalStateException("Not authorized to view this booking");
        }

        return booking;
    }

    public Payment getPaymentByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found"));
    }

    @Transactional
    public List<Booking> createBulkBookings(List<BookingRequest> requests, User user) {
        List<Booking> bookings = new java.util.ArrayList<>();
        for (BookingRequest req : requests) {
            bookings.add(createBooking(req, user));
        }
        return bookings;
    }

    @Transactional
    public List<Payment> processBulkPayments(List<PaymentRequest> requests, User user) {
        List<Payment> payments = new java.util.ArrayList<>();
        for (PaymentRequest req : requests) {
            payments.add(processPayment(req, user));
        }
        return payments;
    }

    @Transactional
    public Booking checkInBooking(Long bookingId, User user) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        // Authorize: user must be admin or organizer of the event
        boolean isOrganizer = booking.getEvent().getOrganizer().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;
        if (!isOrganizer && !isAdmin) {
            throw new IllegalStateException("Not authorized to scan/check-in this ticket");
        }

        if (!booking.getStatus().equals("CONFIRMED")) {
            throw new IllegalStateException("Cannot check-in a ticket that is not CONFIRMED");
        }

        if (booking.isCheckedIn()) {
            throw new IllegalStateException("Ticket has already been scanned/checked-in");
        }

        booking.setCheckedIn(true);
        return bookingRepository.save(booking);
    }
}
