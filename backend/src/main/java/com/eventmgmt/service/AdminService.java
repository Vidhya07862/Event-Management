package com.eventmgmt.service;

import com.eventmgmt.model.Role;
import com.eventmgmt.model.User;
import com.eventmgmt.model.Payment;
import com.eventmgmt.repository.BookingRepository;
import com.eventmgmt.repository.EventRepository;
import com.eventmgmt.repository.PaymentRepository;
import com.eventmgmt.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    public AdminService(
            UserRepository userRepository,
            EventRepository eventRepository,
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository
    ) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public Map<String, Object> getDashboardStats() {
        long totalUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_USER).count();
        long totalOrganizers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_ORGANIZER).count();
        long totalApprovedEvents = eventRepository.findByApprovedTrue().size();
        long totalPendingEvents = eventRepository.findByApprovedFalse().size();
        long totalBookings = bookingRepository.count();

        double totalRevenue = paymentRepository.findAll().stream()
                .filter(p -> "SUCCESS".equalsIgnoreCase(p.getPaymentStatus()))
                .mapToDouble(Payment::getAmount)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalOrganizers", totalOrganizers);
        stats.put("totalApprovedEvents", totalApprovedEvents);
        stats.put("totalPendingEvents", totalPendingEvents);
        stats.put("totalBookings", totalBookings);
        stats.put("totalRevenue", totalRevenue);

        return stats;
    }
}
