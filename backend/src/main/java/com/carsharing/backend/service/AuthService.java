package com.carsharing.backend.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.carsharing.backend.config.JwtUtil;
import com.carsharing.backend.dto.AuthResponse;
import com.carsharing.backend.dto.LoginRequest;
import com.carsharing.backend.dto.SignupRequest;
import com.carsharing.backend.model.User;
import com.carsharing.backend.repository.UserRepository;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepo;

    // RoleRepository removed as dependency for register method

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public ResponseEntity<?> register(SignupRequest request) {
        // 1. Check if email already exists
        if (userRepo.existsByEmail(request.getEmail())) {
            log.warn("Registration attempt failed: Email {} already exists.", request.getEmail());
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
        }

        // 2. Create new User object
        User newUser = new User();
        newUser.setName(request.getName()); // Assumes name is provided
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // 3. Assign default role: PASSENGER
        // Assumes "PASSENGER" role was initialized at startup
        newUser.setRoles(List.of("PASSENGER"));

        // 4. Save the new user
        userRepo.save(newUser);
        log.info("User registered successfully with email: {} and default role PASSENGER", newUser.getEmail());

        // 5. Generate JWT token
        String token = jwtUtil.generateToken(newUser.getEmail(), newUser.getRoles());

        // 6. Create and return response
        AuthResponse responsePayload = new AuthResponse(
            "User registered successfully as PASSENGER.",
            token,
            newUser.getEmail(),
            newUser.getRoles()
        );
        // Use 201 Created status for successful resource creation
        return ResponseEntity.status(HttpStatus.CREATED).body(responsePayload);
    }

    public ResponseEntity<?> login(LoginRequest request) {
        Optional<User> userOptional = userRepo.findByEmail(request.getEmail());

        // Check if user exists AND password matches
        if (userOptional.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOptional.get().getPassword())) {
            log.warn("Login attempt failed for email: {}", request.getEmail());
            // Return generic unauthorized error for security
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        // User exists and password is correct
        User user = userOptional.get();
        String token = jwtUtil.generateToken(user.getEmail(), user.getRoles());
        log.info("Login successful for email: {}", user.getEmail());

        return ResponseEntity.ok(new AuthResponse(
            "Login successful",
            token,
            user.getEmail(),
            user.getRoles())
        );
    }
}