package com.eventmgmt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PaymentRequest(
    @NotNull(message = "Booking ID is required")
    Long bookingId,

    @NotBlank(message = "Payment method is required")
    String paymentMethod
) {}
