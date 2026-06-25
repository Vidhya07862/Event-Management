package com.eventmgmt.service;

import com.eventmgmt.model.MailMessage;
import com.eventmgmt.model.User;
import com.eventmgmt.model.Event;
import com.eventmgmt.repository.MailMessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MailMessageService {

    private final MailMessageRepository mailMessageRepository;
    private final NotificationService notificationService;

    public MailMessageService(MailMessageRepository mailMessageRepository, NotificationService notificationService) {
        this.mailMessageRepository = mailMessageRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public MailMessage sendMessage(User sender, String senderName, String senderEmail, User recipient, Event event, String subject, String message) {
        MailMessage mailMessage = new MailMessage();
        mailMessage.setSender(sender);
        mailMessage.setSenderName(senderName);
        mailMessage.setSenderEmail(senderEmail);
        mailMessage.setRecipient(recipient);
        mailMessage.setEvent(event);
        mailMessage.setSubject(subject);
        mailMessage.setMessage(message);
        mailMessage.setCreatedAt(LocalDateTime.now());
        mailMessage.setRead(false);

        MailMessage saved = mailMessageRepository.save(mailMessage);

        // Also generate a notification for the organizer recipient
        String notifMsg = String.format("New email letter from %s (%s) regarding your event '%s': %s", 
                senderName, senderEmail, event.getTitle(), subject);
        notificationService.createNotification(recipient, notifMsg);

        return saved;
    }

    public List<MailMessage> getReceivedMessages(Long recipientId) {
        return mailMessageRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId);
    }

    @Transactional
    public void markAsRead(Long messageId, Long recipientId) {
        mailMessageRepository.findById(messageId).ifPresent(msg -> {
            if (msg.getRecipient().getId().equals(recipientId)) {
                msg.setRead(true);
                mailMessageRepository.save(msg);
            }
        });
    }

    @Transactional
    public void deleteMessage(Long messageId, Long recipientId) {
        mailMessageRepository.findById(messageId).ifPresent(msg -> {
            if (msg.getRecipient().getId().equals(recipientId)) {
                mailMessageRepository.delete(msg);
            }
        });
    }
}
