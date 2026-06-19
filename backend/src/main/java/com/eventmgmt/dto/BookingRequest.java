package com.eventmgmt.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record BookingRequest(
    @NotNull(message = "Event ID is required")
    Long eventId,

    @NotNull(message = "Ticket count is required")
    @Min(value = 1, message = "Must book at least 1 ticket")
    Integer ticketCount
) {}
