package com.carsharing.backend.controller;

import org.slf4j.Logger;                    
import org.slf4j.LoggerFactory;         
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication; 
import org.springframework.security.core.context.SecurityContextHolder; 
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.carsharing.backend.dto.RideCreationDTO; // Import DTO
import com.carsharing.backend.exception.ResourceNotFoundException;
import com.carsharing.backend.model.Ride;          // Import Model for response type
import com.carsharing.backend.service.RideService; // Import Service

import lombok.Data;
import lombok.Getter;

@Data
@Getter
@RestController
@RequestMapping("/api/driver")
@PreAuthorize("hasRole('DRIVER')") // restrict all methods to DRIVER role
public class DriverController {

    private static final Logger log = LoggerFactory.getLogger(DriverController.class); // Add logger

    @Autowired // Inject the RideService
    private RideService rideService;

    // Implement GET /my-rides using RideService
    @GetMapping("/my-rides")
    public ResponseEntity<String> getMyRides() {
        // Example: Get authenticated user's email and call service
        // Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // String driverEmail = authentication.getName();
        // List<Ride> rides = rideService.findRidesByDriverEmail(driverEmail);
        // return ResponseEntity.ok(rides);
        return ResponseEntity.ok("List of rides offered by this driver (placeholder).");
    }

    /**
     * Endpoint for a driver to offer/create a new ride.
     * @param rideDTO Data transfer object containing ride details.
     * @return ResponseEntity with the created Ride details or error status.
     */
    @PostMapping("/offer-ride") // Use POST for creation
    public ResponseEntity<?> createRide(@RequestBody RideCreationDTO rideDTO) { // Use the DTO
        try {
            // Get the authenticated user's email (which is their username in our setup)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String driverEmail = authentication.getName();
            log.info("Driver '{}' attempting to create a new ride.", driverEmail);

            // Call the service to create the ride
            Ride createdRide = rideService.createRide(rideDTO, driverEmail);

            log.info("Ride created successfully with ID: {}", createdRide.getId());
            // Return the created ride details and a 201 Created status
            return new ResponseEntity<>(createdRide, HttpStatus.CREATED);

        } catch (ResourceNotFoundException e) {
             // If the user somehow wasn't found (e.g., token valid but user deleted)
             log.warn("Failed to create ride: {}", e.getMessage());
             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            // Generic catch block for other potential errors during creation
            log.error("Error creating ride: {}", e.getMessage(), e); // Log the stack trace
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body("An unexpected error occurred while creating the ride."); // User-friendly message
        }
    }

    // Implement PUT /update-ride/{id} using RideService
    @PutMapping("/update-ride/{id}")
    public ResponseEntity<String> updateRide(@PathVariable String id) {
        // Needs RideUpdateDTO, validation (ensure driver owns the ride), call RideService
        return ResponseEntity.ok("Ride with ID " + id + " updated (placeholder).");
    }

    // Implement DELETE /delete-ride/{id} using RideService
    @DeleteMapping("/delete-ride/{id}")
    public ResponseEntity<String> deleteRide(@PathVariable String id) {
        // Needs validation (ensure driver owns the ride), logic to handle existing bookings, call RideService
        return ResponseEntity.ok("Ride with ID " + id + " deleted (placeholder).");
    }

    // Implement GET /ride-requests using BookingService
    @GetMapping("/ride-requests")
    public ResponseEntity<String> viewRequests() {
        // Needs to call BookingService to find bookings with status 'REQUESTED' for this driver's rides.
        return ResponseEntity.ok("List of ride requests to accept/deny (placeholder).");
    }

    // Implement POST /bookings/{bookingId}/confirm and /reject using BookingService
    // Example:
    // @PostMapping("/bookings/{bookingId}/confirm")
    // public ResponseEntity<?> confirmBooking(@PathVariable String bookingId) { ... }
}