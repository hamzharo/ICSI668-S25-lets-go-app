package com.carsharing.backend.service;

import java.util.ArrayList;
import java.util.List;

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
import com.carsharing.backend.model.Role;
import com.carsharing.backend.model.User;
import com.carsharing.backend.repository.RoleRepository;
import com.carsharing.backend.repository.UserRepository;

 

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class); // Add logger

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private RoleRepository roleRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public ResponseEntity<?> register(SignupRequest request) {
        if (userRepo.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        List<String> rolesFromDB = new ArrayList<>();
        for (String role : request.getRoles()) {
            Role foundRole = roleRepo.findByName(role).orElseThrow(() -> new RuntimeException("Role not found"));
            rolesFromDB.add(foundRole.getName());
        }

        User newUser = new User();
        newUser.setName(request.getName());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setRoles(rolesFromDB);
        userRepo.save(newUser);

        String token = jwtUtil.generateToken(newUser.getEmail(), newUser.getRoles());
        AuthResponse responsePayload = new AuthResponse("User registered", token, newUser.getEmail(), newUser.getRoles());
        log.info("Register method successful for {}. Returning 200 OK.", newUser.getEmail());
        return ResponseEntity.ok(responsePayload);
    }

    public ResponseEntity<?> login(LoginRequest request) {
        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRoles());
        return ResponseEntity.ok(new AuthResponse("Login successful", token, user.getEmail(), user.getRoles()));
    }
}
