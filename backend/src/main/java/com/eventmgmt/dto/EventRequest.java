package com.eventmgmt.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record EventRequest(
    @NotBlank(message = "Title is required")
    String title,

    String description,

    @NotBlank(message = "Location is required")
    String location,

    @NotNull(message = "Event date is required")
    @Future(message = "Event date must be in the future")
    LocalDateTime date,

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price cannot be negative")
    Double price,

    String imageUrl
) {}
