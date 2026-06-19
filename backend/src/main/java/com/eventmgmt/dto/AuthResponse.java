package com.eventmgmt.dto;

import com.eventmgmt.model.Role;

public record AuthResponse(
    String token,
    Long userId,
    String name,
    String email,
    Role role
) {}
