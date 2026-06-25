package com.eventmgmt.controller;

import com.eventmgmt.dto.MailMessageRequest;
import com.eventmgmt.model.Event;
import com.eventmgmt.model.MailMessage;
import com.eventmgmt.model.User;
import com.eventmgmt.repository.EventRepository;
import com.eventmgmt.service.MailMessageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MailMessageController {

    private final MailMessageService mailMessageService;
    private final EventRepository eventRepository;

    public MailMessageController(MailMessageService mailMessageService, EventRepository eventRepository) {
        this.mailMessageService = mailMessageService;
        this.eventRepository = eventRepository;
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody MailMessageRequest request) {

        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        Event event = eventRepository.findById(request.eventId())
                .orElse(null);
        if (event == null) {
            return ResponseEntity.badRequest().body("Event not found");
        }

        User recipient = event.getOrganizer();
        if (recipient == null) {
            return ResponseEntity.badRequest().body("Organizer not found for this event");
        }

        MailMessage msg = mailMessageService.sendMessage(
                user,
                request.senderName(),
                request.senderEmail(),
                recipient,
                event,
                request.subject(),
                request.message()
        );

        return ResponseEntity.ok(msg);
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<MailMessage>> getInbox(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(mailMessageService.getReceivedMessages(user.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        mailMessageService.markAsRead(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        mailMessageService.deleteMessage(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
