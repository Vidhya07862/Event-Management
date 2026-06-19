package com.eventmgmt.config;

import com.eventmgmt.model.Event;
import com.eventmgmt.model.Role;
import com.eventmgmt.model.User;
import com.eventmgmt.repository.EventRepository;
import com.eventmgmt.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, EventRepository eventRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            // Seed Admin User
            User admin = new User(
                    null,
                    "System Admin",
                    "admin@eventmgmt.com",
                    passwordEncoder.encode("admin123"),
                    Role.ROLE_ADMIN,
                    "+111222333"
            );
            userRepository.save(admin);

            // Seed Organizer User
            User organizer = new User(
                    null,
                    "Jane Organizer",
                    "organizer@eventmgmt.com",
                    passwordEncoder.encode("organizer123"),
                    Role.ROLE_ORGANIZER,
                    "+444555666"
            );
            userRepository.save(organizer);

            // Seed User
            User user = new User(
                    null,
                    "John Attendee",
                    "user@eventmgmt.com",
                    passwordEncoder.encode("user123"),
                    Role.ROLE_USER,
                    "+777888999"
            );
            userRepository.save(user);

            System.out.println("--- Database Seeded Successfully with default accounts ---");
            System.out.println("Admin User: admin@eventmgmt.com / admin123");
            System.out.println("Organizer: organizer@eventmgmt.com / organizer123");
            System.out.println("Regular User: user@eventmgmt.com / user123");
            System.out.println("---------------------------------------------------------");

            // Seed Sample Events
            if (eventRepository.count() == 0) {
                Event music = new Event(
                        null,
                        "Neon Beats Music Festival",
                        "Get ready for the biggest electronic music concert of the year! Neon Beats features top global DJs, state-of-the-art laser light shows, premium food stalls, and an unforgettable open-air experience.",
                        "Central Park Amphitheater, New York",
                        LocalDateTime.now().plusDays(30),
                        45.00,
                        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
                        organizer,
                        true
                );
                eventRepository.save(music);

                Event yoga = new Event(
                        null,
                        "Zen Yoga & Mindfulness Morning",
                        "Start your morning with peace. Bring your yoga mat and join us for a 60-minute Vinyasa flow followed by a guided 20-minute breathing meditation in the heart of the botanical gardens.",
                        "Botanical Green Gardens, Portland",
                        LocalDateTime.now().plusDays(15),
                        0.00,
                        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
                        organizer,
                        true
                );
                eventRepository.save(yoga);

                Event drawing = new Event(
                        null,
                        "Urban Canvas Graffiti Workshop",
                        "Unleash your creativity! Join local street artists for a hands-on graffiti and spray painting workshop. We provide the canvasses, spray cans, masks, and protective gear.",
                        "The Art Warehouse District, Austin",
                        LocalDateTime.now().plusDays(20),
                        15.00,
                        "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800",
                        organizer,
                        true
                );
                eventRepository.save(drawing);

                Event tech = new Event(
                        null,
                        "Global Tech Summit 2026",
                        "Join thousands of developers, researchers, and tech founders for a 2-day summit on Artificial Intelligence, Web3 Development, and Cloud Architecture. Hear from industry leaders.",
                        "Silicon Valley Tech Center, California",
                        LocalDateTime.now().plusDays(40),
                        120.00,
                        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
                        organizer,
                        true
                );
                eventRepository.save(tech);

                System.out.println("--- Seed events (Music, Yoga, Drawing, Tech) populated successfully ---");
            }
        }
    }
}
