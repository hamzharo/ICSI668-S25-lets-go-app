package com.carsharing.backend.controller;

import java.util.List; // Import List

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
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


import com.carsharing.backend.dto.RideCreationDTO;
import com.carsharing.backend.exception.BookingException;
import com.carsharing.backend.exception.ResourceNotFoundException;
import com.carsharing.backend.model.Booking;
import com.carsharing.backend.model.Ride;
import com.carsharing.backend.service.BookingService;
import com.carsharing.backend.service.RideService;

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

    @Autowired // Inject BookingService
    private BookingService bookingService;

        // --- Ride Management ---
    // Implement GET /my-rides using RideService
    @GetMapping("/my-rides")
    public ResponseEntity<?> getMyRides() {
         
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String driverEmail = authentication.getName();
            log.info("Driver '{}' requesting their offered rides.", driverEmail);

            List<Ride> rides = rideService.findRidesByDriverEmail(driverEmail);

            if (rides.isEmpty()) {
                log.info("No rides found for driver '{}'.", driverEmail);
                // Return 204 No Content if the list is empty but the request was successful
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            log.info("Returning {} rides for driver '{}'.", rides.size(), driverEmail);
            return ResponseEntity.ok(rides); // Return 200 OK with the list

        } catch (ResourceNotFoundException e) {
            // This shouldn't happen if the token is valid, but handle defensively
             log.warn("Get my rides failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error fetching rides for current driver: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body("An unexpected error occurred while retrieving your rides.");
        }
    }

    
      //Endpoint for a driver to offer/create a new ride.

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
    
    @PostMapping("/bookings/{bookingId}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable String bookingId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String driverEmail = authentication.getName();

            Booking confirmedBooking = bookingService.confirmBooking(bookingId, driverEmail);
            return ResponseEntity.ok(confirmedBooking); // 200 OK on success

        } catch (ResourceNotFoundException e) {
             log.warn("Confirm booking failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (BookingException e) {
            log.warn("Confirm booking failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (AccessDeniedException e) { // Catch specific authorization errors
            log.warn("Confirm booking failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error confirming booking {}: {}", bookingId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body("An unexpected error occurred while confirming the booking.");
        }
    }

    /**
     * Endpoint for a driver to reject a pending booking request.
     * @param bookingId The ID of the booking to reject.
     * @return ResponseEntity with the updated Booking details or error status.
     */
    @PostMapping("/bookings/{bookingId}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable String bookingId) {
         try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String driverEmail = authentication.getName();

            Booking rejectedBooking = bookingService.rejectBooking(bookingId, driverEmail);
            return ResponseEntity.ok(rejectedBooking); // 200 OK on success

        } catch (ResourceNotFoundException e) {
             log.warn("Reject booking failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (BookingException e) {
            log.warn("Reject booking failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (AccessDeniedException e) { // Catch specific authorization errors
            log.warn("Reject booking failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error rejecting booking {}: {}", bookingId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body("An unexpected error occurred while rejecting the booking.");
        }
    }
}