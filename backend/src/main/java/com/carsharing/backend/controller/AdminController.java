package com.carsharing.backend.controller;

import com.carsharing.backend.exception.ActionNotAllowedException;
import com.carsharing.backend.exception.ResourceNotFoundException;
import com.carsharing.backend.model.User;
import com.carsharing.backend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/admin") // Base path for admin actions
@PreAuthorize("hasRole('ADMIN')") // All endpoints require ADMIN role
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserService userService;

    /**
     * Endpoint to list users pending driver approval.
     * @return List of User profiles (DTOs recommended).
     */
    @GetMapping("/drivers/pending")
    public ResponseEntity<List<PassengerController.UserProfileDTO>> getPendingDriverApplications() {
        // Using inner DTO from PassengerController for now
        try {
            List<User> pendingUsers = userService.listPendingDriverApplications();
             List<PassengerController.UserProfileDTO> pendingProfiles = pendingUsers.stream()
                 .map(user -> new PassengerController.UserProfileDTO(
                         user.getId(), user.getName(), user.getEmail(), user.getRoles(), user.getDriverStatus()))
                 .collect(Collectors.toList());

            if (pendingProfiles.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return ResponseEntity.ok(pendingProfiles);
        } catch (Exception e) {
            log.error("Error fetching pending driver applications: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Endpoint for an admin to approve a driver application.
     * @param userId The ID of the user whose application is being approved.
     * @return ResponseEntity with the updated user profile or error status.
     */
    @PostMapping("/drivers/{userId}/approve")
    public ResponseEntity<?> approveDriver(@PathVariable String userId) {
        try {
            User approvedUser = userService.approveDriverApplication(userId);
            // Return DTO
             PassengerController.UserProfileDTO profile = new PassengerController.UserProfileDTO(
                    approvedUser.getId(), approvedUser.getName(), approvedUser.getEmail(), approvedUser.getRoles(), approvedUser.getDriverStatus());
            return ResponseEntity.ok(profile);

        } catch (ResourceNotFoundException e) {
            log.warn("Approve driver failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (ActionNotAllowedException e) {
             log.warn("Approve driver failed: {}", e.getMessage());
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error approving driver application for user {}: {}", userId, e.getMessage(), e);
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Endpoint for an admin to reject a driver application.
     * @param userId The ID of the user whose application is being rejected.
     * @return ResponseEntity with the updated user profile or error status.
     */
    @PostMapping("/drivers/{userId}/reject")
    public ResponseEntity<?> rejectDriver(@PathVariable String userId) {
         try {
            User rejectedUser = userService.rejectDriverApplication(userId);
            // Return DTO
             PassengerController.UserProfileDTO profile = new PassengerController.UserProfileDTO(
                    rejectedUser.getId(), rejectedUser.getName(), rejectedUser.getEmail(), rejectedUser.getRoles(), rejectedUser.getDriverStatus());
            return ResponseEntity.ok(profile);

        } catch (ResourceNotFoundException e) {
            log.warn("Reject driver failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (ActionNotAllowedException e) {
             log.warn("Reject driver failed: {}", e.getMessage());
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error rejecting driver application for user {}: {}", userId, e.getMessage(), e);
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

     // Add other admin endpoints from UserController later if desired
     // e.g., GET /users, DELETE /users/{id} could be moved here

}