package com.eventmgmt.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MailMessageRequest(
    @NotNull(message = "Event ID is required")
    Long eventId,

    @NotBlank(message = "Sender name is required")
    String senderName,

    @NotBlank(message = "Sender email is required")
    @Email(message = "Invalid email format")
    String senderEmail,

    @NotBlank(message = "Subject is required")
    String subject,

    @NotBlank(message = "Message content is required")
    String message
) {}
