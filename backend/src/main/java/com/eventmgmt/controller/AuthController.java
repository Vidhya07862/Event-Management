package com.eventmgmt.controller;

import com.eventmgmt.dto.AuthResponse;
import com.eventmgmt.dto.LoginRequest;
import com.eventmgmt.dto.RegisterRequest;
import com.eventmgmt.model.User;
import com.eventmgmt.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PutMapping("/profile/{id}")
    public ResponseEntity<User> updateProfile(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Simple authorization check
        if (userDetails == null || (!userDetails.getUsername().equals(body.get("email")) && 
            !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")))) {
            return ResponseEntity.status(403).build();
        }

        String name = body.get("name");
        String phone = body.get("phone");
        return ResponseEntity.ok(authService.updateProfile(id, name, phone));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDetails> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userDetails);
    }
}
