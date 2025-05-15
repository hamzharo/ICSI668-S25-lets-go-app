package com.carsharing.backend.controller;

import java.util.List;
import java.util.Optional;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication; // Import for getting principal
import org.springframework.security.core.context.SecurityContextHolder; // Import for getting context
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile; // Import MultipartFile
import org.springframework.web.bind.annotation.RequestParam; // Import RequestParam


import com.carsharing.backend.service.UserService; // Import UserService
import com.carsharing.backend.exception.FileStorageException; // Import FileStorageException
import com.carsharing.backend.exception.ResourceNotFoundException;
import com.carsharing.backend.model.User;
import com.carsharing.backend.repository.UserRepository;

import com.mongodb.lang.NonNull;

import org.slf4j.Logger;


@RestController
@RequestMapping("/api/users")
public class UserController {

        private static final Logger log = LoggerFactory.getLogger(UserController.class); // Added logger

    @Autowired
    private UserRepository userRepository;

    @Autowired // Inject UserService
    private UserService userService;

    // Get all users - Only for Admins
    @NonNull
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            if (users.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            // Consider creating a UserDTO to avoid exposing passwords, even if hashed
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error fetching users with pagination: {}", e.getMessage(), e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get the profile of the currently logged-in user
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()") // Any authenticated user can access this
    public ResponseEntity<?> getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
             return new ResponseEntity<>("User not authenticated", HttpStatus.UNAUTHORIZED);
        }
        String userEmail = authentication.getName(); // Email is used as username in JwtFilter

        Optional<User> userData = userRepository.findByEmail(userEmail);

        if (userData.isPresent()) {
             // IMPORTANT: Return a DTO here, not the raw User object to avoid exposing password hash
             User user = userData.get();
             // Example basic DTO (create this class)
             UserProfileDTO profile = new UserProfileDTO(user.getId(), user.getName(), user.getEmail(), user.getRoles());
            return new ResponseEntity<>(profile, HttpStatus.OK);
        } else {
            // This case should theoretically not happen if the token is valid,
            // but good practice to handle it.
            return new ResponseEntity<>("User profile not found for authenticated user.", HttpStatus.NOT_FOUND);
        }
    }

    // Get a specific user by ID - Only for Admins (or maybe user themselves?)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Restrict to Admin for now
    public ResponseEntity<User> getUserById(@PathVariable("id") String id) {
        Optional<User> userData = userRepository.findById(id);
        if (userData.isPresent()) {
            // Again, consider a DTO response
            return new ResponseEntity<>(userData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Get a specific user by email - Only for Admins
    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserByEmail(@PathVariable("email") String email) {
        Optional<User> userData = userRepository.findByEmail(email);
        if (userData.isPresent()) {
             // Again, consider a DTO response
            return new ResponseEntity<>(userData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a user - Only for Admins
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable("id") String id) {
        try {
            if (!userRepository.existsById(id)) {
                 return new ResponseEntity<>("User not found.", HttpStatus.NOT_FOUND);
            }
            userRepository.deleteById(id);
            return new ResponseEntity<>("User deleted successfully.", HttpStatus.OK);
        } catch (Exception e) {
             // Log the exception e
            return new ResponseEntity<>("Error deleting user.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

 // --- NEW ENDPOINT for Document Upload ---
    /**
     * Endpoint for the authenticated user to upload a document.
     * @param file The uploaded file (multipart).
     * @param documentType String indicating the type of document (e.g., "LICENSE").
     * @return ResponseEntity with updated user profile (DTO recommended) or error status.
     */
    @PostMapping("/me/documents") // Upload related to the authenticated user
    @PreAuthorize("isAuthenticated()") // Any logged-in user can upload to their own profile
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType) {

        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();

            log.info("Received document upload request for user '{}', type '{}'", userEmail, documentType);

            User updatedUser = userService.uploadDocument(userEmail, file, documentType);

            // Return updated profile DTO (important to avoid sending password hash)
             PassengerController.UserProfileDTO profile = new PassengerController.UserProfileDTO(
                 updatedUser.getId(), updatedUser.getName(), updatedUser.getEmail(), updatedUser.getRoles(), updatedUser.getDriverStatus()
             );
            // Include the documents list in the response DTO if needed by frontend
            // profile.setDocuments(updatedUser.getDocuments()); // Requires adding to DTO

            return ResponseEntity.ok(profile);

        } catch (ResourceNotFoundException e) {
             log.warn("Document upload failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (FileStorageException | IllegalArgumentException e) { // Catch file storage or validation issues
            log.warn("Document upload failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
             log.error("Error uploading document for user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body("An unexpected error occurred during document upload.");
        }
    }

    

    // --- Placeholder DTO for /me endpoint ---
    // Create this as a separate file in your dto package or as an inner class
    public static class UserProfileDTO {
        public String id;
        public String name;
        public String email;
        public List<String> roles;
        public String driverStatus; 


        public UserProfileDTO(String id, String name, String email, List<String> roles) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.roles = roles;
            this.driverStatus = driverStatus;
        }
        // Add getters if needed, or make fields public for simplicity if inner class
    }
}