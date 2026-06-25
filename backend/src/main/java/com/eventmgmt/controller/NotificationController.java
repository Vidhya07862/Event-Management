package com.eventmgmt.controller;

import com.eventmgmt.model.Notification;
import com.eventmgmt.model.User;
import com.eventmgmt.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(notificationService.getRecipientNotifications(user.getId()));
    }

    @PutMapping("/read")
    public ResponseEntity<Void> markAsRead(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.noContent().build();
    }
}
