package com.carsharing.backend.util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Utility class for accessing details of the currently authenticated user.
 */
public final class AuthenticationUtil { // Make final, no instances needed

    private static final Logger log = LoggerFactory.getLogger(AuthenticationUtil.class);

    // Private constructor to prevent instantiation
    private AuthenticationUtil() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    /**
     * Retrieves the email (username) of the currently authenticated user.
     *
     * @return The email of the logged-in user.
     * @throws IllegalStateException if no user is authenticated.
     */
    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
            log.warn("Attempted to get current user email, but no authentication found or user is not authenticated.");
            throw new IllegalStateException("No authenticated user found in the security context.");
            // Or return null/Optional.empty() depending on how you want to handle anonymous access if ever needed
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername(); // Standard Spring Security way
        } else if (principal instanceof String) {
            return (String) principal; // Sometimes the principal is just the username string
        } else {
            log.error("Unexpected principal type found in SecurityContext: {}", principal.getClass().getName());
            throw new IllegalStateException("Could not extract username from principal of type: " + principal.getClass().getName());
        }
    }

    /**
     * Retrieves the User ID of the currently authenticated user.
     * NOTE: This assumes your UserDetails implementation (or principal) directly holds the ID
     * or that you modify your security setup to include it.
     * If your principal is just the email string, you'll need to query the UserRepository.
     *
     * Let's provide a placeholder that assumes you'll need to fetch it.
     * For efficiency, consider storing the User ID in the JWT claims if possible.
     *
     * @param userRepository The UserRepository instance to fetch the user by email.
     * @return The ID (String) of the logged-in user.
     * @throws IllegalStateException if no user is authenticated or user not found in DB.
     */
    // public static String getCurrentUserId(UserRepository userRepository) { // <-- Requires passing UserRepository
    //     String email = getCurrentUserEmail(); // Get email first
    //     return userRepository.findByEmail(email)
    //             .map(User::getId) // Assumes your User model has getId()
    //             .orElseThrow(() -> {
    //                 log.error("Authenticated user with email '{}' not found in the database.", email);
    //                 return new IllegalStateException("Authenticated user not found in database.");
    //             });
    // }

     // --- Alternative if User ID is directly in Principal (e.g., custom UserDetails) ---
     /*
     public static String getCurrentUserIdFromPrincipal() {
         Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
         // ... null checks ...
         Object principal = authentication.getPrincipal();
         if (principal instanceof YourCustomUserDetails) { // Replace with your actual UserDetails class if you have one
             return ((YourCustomUserDetails) principal).getId(); // Assumes getId() method exists
         } else {
              log.warn("Cannot extract User ID directly from principal type: {}", principal.getClass().getName());
              // Fallback to fetching via email might be needed here, or throw an exception.
              throw new IllegalStateException("Cannot extract User ID directly from principal.");
         }
     }
     */
}