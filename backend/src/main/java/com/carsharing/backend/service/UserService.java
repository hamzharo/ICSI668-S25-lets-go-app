package com.carsharing.backend.service;

import com.carsharing.backend.exception.ActionNotAllowedException; 
import com.carsharing.backend.exception.ResourceNotFoundException;
import com.carsharing.backend.model.User;
import com.carsharing.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException; // Keep this

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.ArrayList; 
import java.util.List;
import java.util.Set; 

@Service
public class UserService { // Or DriverApplicationService

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    // Status Constants (Consider moving to a shared place or Enum later)
    public static final String DRIVER_STATUS_NONE = "NONE";
    public static final String DRIVER_STATUS_PENDING = "PENDING_APPROVAL";
    public static final String DRIVER_STATUS_APPROVED = "APPROVED";
    public static final String DRIVER_STATUS_REJECTED = "REJECTED";

    public static final String ROLE_DRIVER = "DRIVER";
    public static final String ROLE_PASSENGER = "PASSENGER"; // If needed

    // States that prevent a new application
    private static final Set<String> NON_APPLICABLE_STATES = Set.of(
            DRIVER_STATUS_PENDING, DRIVER_STATUS_APPROVED
    );

    @Autowired
    private UserRepository userRepository;

    // --- Driver Application Logic ---

    @Transactional
    public User applyForDriverRole(String applicantEmail) {
        log.info("User '{}' applying for DRIVER role.", applicantEmail);
        User user = findUserByEmail(applicantEmail);

    // --- FIX: Handle potential null driverStatus ---
    String currentStatus = user.getDriverStatus();
    if (currentStatus == null) {
    // If status is null in DB, treat it as NONE for application purposes
    currentStatus = DRIVER_STATUS_NONE;
    // Optionally update the user object in memory for consistency below,
    // it will be saved later anyway if the application proceeds.
    user.setDriverStatus(currentStatus);
    }

        // Validation: Check current status
        if (NON_APPLICABLE_STATES.contains(user.getDriverStatus())) {
            log.warn("User '{}' attempted to apply for driver role but status is already '{}'", applicantEmail, user.getDriverStatus());
            throw new ActionNotAllowedException("Cannot apply for driver role. Current status: " + user.getDriverStatus());
        }
        // Validation: Check if already has DRIVER role (should align with APPROVED status, but good check)
        if (user.getRoles() != null && user.getRoles().contains(ROLE_DRIVER)) {
             log.warn("User '{}' attempted to apply for driver role but already has the role.", applicantEmail);
              // Optionally update status to APPROVED if it wasn't already
             if (!DRIVER_STATUS_APPROVED.equals(user.getDriverStatus())) {
                 user.setDriverStatus(DRIVER_STATUS_APPROVED);
                 return userRepository.save(user);
             }
             throw new ActionNotAllowedException("User already has the DRIVER role.");
        }


        // Update status to PENDING
        user.setDriverStatus(DRIVER_STATUS_PENDING);
        // TAdd logic here later to mark required documents as needed

        User updatedUser = userRepository.save(user);
        log.info("User '{}' driver application status set to PENDING_APPROVAL.", applicantEmail);
        // Send notification to Admin later
        return updatedUser; // Return updated user (without sensitive info ideally)
    }

    // --- Admin Management Logic ---

    public List<User> listPendingDriverApplications() {
        log.info("Fetching users with PENDING_APPROVAL driver status.");
        // Need a repository method for this
        return userRepository.findByDriverStatus(DRIVER_STATUS_PENDING);
    }

    @Transactional
    public User approveDriverApplication(String userIdToApprove) {
        log.info("Attempting to approve driver application for user ID: {}", userIdToApprove);
        User user = findUserById(userIdToApprove);

        // Validation
        if (!DRIVER_STATUS_PENDING.equals(user.getDriverStatus())) {
            log.warn("Cannot approve user ID: {}. Status is '{}', expected '{}'", userIdToApprove, user.getDriverStatus(), DRIVER_STATUS_PENDING);
            throw new ActionNotAllowedException("Cannot approve application. User status is not PENDING_APPROVAL.");
        }
        // Add check here later to ensure required documents were uploaded/verified

        // Update Status
        user.setDriverStatus(DRIVER_STATUS_APPROVED);

        // Add DRIVER Role (ensure list exists and role isn't duplicated)
        List<String> currentRoles = user.getRoles();
        if (currentRoles == null) {
            currentRoles = new ArrayList<>();
        }
        if (!currentRoles.contains(ROLE_DRIVER)) {
            currentRoles.add(ROLE_DRIVER);
            user.setRoles(currentRoles);
            log.info("Added DRIVER role to user ID: {}", userIdToApprove);
        } else {
             log.warn("User ID: {} already had DRIVER role during approval.", userIdToApprove);
        }

        User approvedUser = userRepository.save(user);
        log.info("Driver application approved for user ID: {}", userIdToApprove);
        // Send notification to User later
        return approvedUser; // Return updated user
    }

    @Transactional
    public User rejectDriverApplication(String userIdToReject) {
         log.info("Attempting to reject driver application for user ID: {}", userIdToReject);
        User user = findUserById(userIdToReject);

         // Validation
        if (!DRIVER_STATUS_PENDING.equals(user.getDriverStatus())) {
            log.warn("Cannot reject user ID: {}. Status is '{}', expected '{}'", userIdToReject, user.getDriverStatus(), DRIVER_STATUS_PENDING);
            throw new ActionNotAllowedException("Cannot reject application. User status is not PENDING_APPROVAL.");
        }
        // Add rejection reason later?

        // Update Status
        user.setDriverStatus(DRIVER_STATUS_REJECTED);
        // Do NOT add DRIVER role

        User rejectedUser = userRepository.save(user);
        log.info("Driver application rejected for user ID: {}", userIdToReject);
         // Send notification to User later
        return rejectedUser; // Return updated user
    }


    // --- Helper Methods ---
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

     private User findUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
    }

     // Consider adding a basic getUserProfile(String email/id) method here
     // returning a DTO to avoid exposing password hash in responses.
}