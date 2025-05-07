package com.carsharing.backend.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails; // Keep this import

// Removed @Component as it's a utility class with static methods
public final class AuthenticationUtil {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationUtil.class);

    // Private constructor to prevent instantiation
    private AuthenticationUtil() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    /**
     * Retrieves the email (username) of the currently authenticated user.
     *
     * @return The email of the logged-in user.
     * @throws IllegalStateException if no user is authenticated or username cannot be extracted.
     */
    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Attempted to get current user email, but no authentication found or user is not authenticated.");
            // Depending on your application's strictness, you might throw an exception
            // or return null if an unauthenticated context is possible in some flows.
            // For protected resources, an exception is usually better.
            throw new IllegalStateException("No authenticated user found in the security context.");
        }

        Object principal = authentication.getPrincipal();

        if (principal == null) {
            log.warn("Authenticated principal is null.");
            throw new IllegalStateException("Authenticated principal is null.");
        }

        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername(); // Standard Spring Security way to get username
        } else if (principal instanceof String) {
            return (String) principal; // If the principal itself is the username string
        } else {
            // If the principal is your custom User object directly (less common with UserDetailsService setup but possible)
            // and your User object has an getEmail() method:
            // if (principal instanceof com.carsharing.backend.model.User) {
            //     return ((com.carsharing.backend.model.User) principal).getEmail();
            // }
            log.error("Unexpected principal type found in SecurityContext: {}", principal.getClass().getName());
            throw new IllegalStateException("Could not extract username from principal of type: " + principal.getClass().getName());
        }
    }
}