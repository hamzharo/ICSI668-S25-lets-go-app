package com.carsharing.backend.config;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.carsharing.backend.model.User; // Assuming your User model location
import com.carsharing.backend.repository.UserRepository; // Assuming your Repo location
// import com.carsharing.backend.lwtUnit; // Assuming JwtUtil is in a util package

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j // Optional: Lombok annotation for logging
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    // Define the paths that should bypass JWT validation
    private static final List<String> PUBLIC_PATHS = Arrays.asList(
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/health",
            "/"
    );

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain chain
    ) throws ServletException, IOException {

        final String path = request.getServletPath();
        final String method = request.getMethod();

        // Bypass logic for public paths and OPTIONS requests
        boolean isPublicPath = PUBLIC_PATHS.stream().anyMatch(path::equals);
        if (isPublicPath || "OPTIONS".equalsIgnoreCase(method)) {
            log.debug("Bypassing JWT filter for public path or OPTIONS request: {} {}", method, path);
            chain.doFilter(request, response);
            return;
        }

        // Token Extraction and Validation
        final String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                if (jwtUtil.validateToken(token)) {
                    email = jwtUtil.extractEmail(token);
                } else {
                    log.warn("JWT Token validation failed for token: {}", token);
                }
            } catch (Exception e) {
                 log.error("Error validating JWT token: {}", e.getMessage());
            }
        } else {
             log.debug("Authorization header missing or not Bearer type for path: {}", path);
        }

        // Set Authentication Context if token is valid and user exists
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (userOptional.isPresent()) {
                User user = userOptional.get();

                // --- FIX IS HERE ---
                // Create authorities list directly from role Strings
                 List<GrantedAuthority> authorities = user.getRoles() == null ? List.of() : user.getRoles().stream()
                         // Use the role string directly, assuming getRoles() returns Collection<String>
                         .map(roleString -> new SimpleGrantedAuthority("ROLE_" + roleString.toUpperCase()))
                         .collect(Collectors.toList());
                // --- END FIX ---

                log.debug("User '{}' found with roles {}. Setting authentication context.", email, authorities);

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email, // Principal can be User object
                        null,
                        authorities
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                 log.warn("User not found in repository for email extracted from JWT: {}", email);
            }
        }

        // Continue the filter chain
        chain.doFilter(request, response);
    }
}