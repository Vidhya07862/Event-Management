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
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;

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

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getDemoUsers() {
        List<User> users = authService.getAllUsers();
        List<Map<String, Object>> response = new ArrayList<>();
        for (User u : users) {
            Map<String, Object> uMap = new HashMap<>();
            uMap.put("id", u.getId());
            uMap.put("name", u.getName());
            uMap.put("email", u.getEmail());
            uMap.put("role", u.getRole() != null ? u.getRole().name() : "");
            response.add(uMap);
        }
        return ResponseEntity.ok(response);
    }
}
