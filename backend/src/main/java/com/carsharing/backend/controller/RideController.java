package com.carsharing.backend.controller;

import com.carsharing.backend.dto.BookingDTO;
import com.carsharing.backend.dto.BookingRequestDTO; // Import DTO
import com.carsharing.backend.exception.BookingException; // Import custom exceptions
import com.carsharing.backend.exception.ResourceNotFoundException;
// import com.carsharing.backend.model.Booking; // Import Booking model
import com.carsharing.backend.service.BookingService; // Import BookingService
import com.carsharing.backend.service.RideService;    // Import RideService
import org.slf4j.Logger;                      // Import Logger
import org.slf4j.LoggerFactory;            // Import LoggerFactory
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat; // For parsing date params
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication; // Import Authentication
import org.springframework.security.core.context.SecurityContextHolder; // Import SecurityContextHolder
import org.springframework.web.bind.annotation.*;
import com.carsharing.backend.dto.RideDTO; 

import java.time.LocalDateTime;
import java.util.List; // Import List

@RestController
@RequestMapping("/api/rides")
public class RideController {

    private static final Logger log = LoggerFactory.getLogger(RideController.class); // Add logger

    @Autowired // Inject RideService
    private RideService rideService;

    @Autowired // Inject BookingService
    private BookingService bookingService;

    /**
     * Searches for available rides based on criteria.
     * Accessible by PASSENGER and DRIVER roles.
     *
     * @param departureCity         Required departure city.
     * @param destinationCity       Required destination city.
     * @param earliestDepartureTime Optional earliest departure time (ISO format). Defaults to now.
     * @return ResponseEntity containing a list of matching rides or appropriate error/status.
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('PASSENGER', 'DRIVER')")
    public ResponseEntity<?> searchRides(
            @RequestParam String departureCity, // Make required for basic search
            @RequestParam String destinationCity, // Make required for basic search
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime earliestDepartureTime
            // Add more optional params later: latestDepartureTime, minSeats, etc.
    ) {
        log.info("Received ride search request from '{}' to '{}', departing after '{}'",
                 departureCity, destinationCity, earliestDepartureTime);
        try {
            // Use current time if not specified by user
            LocalDateTime searchTime = (earliestDepartureTime != null) ? earliestDepartureTime : LocalDateTime.now();

            List<RideDTO> matchingRides = rideService.searchRides(departureCity, destinationCity, searchTime);

            if (matchingRides.isEmpty()) {
                log.info("No matching rides found for search criteria.");
                // Return 204 No Content - standard for successful request with no results
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            log.info("Found {} matching rides.", matchingRides.size());
            return ResponseEntity.ok(matchingRides); // 200 OK with list of rides

        } catch (Exception e) {
             log.error("Error searching for rides: {}", e.getMessage(), e); // Log the exception
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while searching for rides."); // User-friendly message
        }
    }

    /**
     * Allows a PASSENGER to request a booking for a specific ride.
     *
     * @param rideId            The ID of the ride to book.
     * @param bookingRequestDTO DTO containing the number of seats requested.
     * @return ResponseEntity containing the created Booking details or appropriate error.
     */
    @PostMapping("/request/{rideId}")
    @PreAuthorize("hasRole('PASSENGER')")
    public ResponseEntity<?> requestRide(
            @PathVariable String rideId,
            @RequestBody BookingRequestDTO bookingRequestDTO // Use the DTO
    ) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String passengerEmail = authentication.getName();
            log.info("Passenger '{}' requesting booking for ride '{}' with {} seats",
                     passengerEmail, rideId, bookingRequestDTO.getRequestedSeats());

            BookingDTO createdBookingDTO = bookingService.requestBooking(rideId, bookingRequestDTO, passengerEmail);

            log.info("Booking request successful, created booking ID: {}", createdBookingDTO.getId());
            // Return 201 Created with the booking details
            return new ResponseEntity<>(createdBookingDTO, HttpStatus.CREATED);

        } catch (ResourceNotFoundException e) {
            log.warn("Booking request failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (BookingException e) {
            // Catch specific booking logic errors (e.g., no seats, already booked)
            log.warn("Booking request failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
             log.error("Error requesting booking for ride {}: {}", rideId, e.getMessage(), e); // Log the exception
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                     .body("An unexpected error occurred while requesting the booking."); // User-friendly message
        }
    }





 // --- NEW Ride Lifecycle Endpoints (Driver Only) ---

    /**
     * Endpoint for the driver to start their scheduled ride.
     * Accessible only by DRIVER role.
     * @param rideId The ID of the ride to start.
     * @return ResponseEntity containing the updated RideDTO or error (handled by exceptions).
     */
    @PutMapping("/{rideId}/start") // Use PUT for state change
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<RideDTO> startRide(@PathVariable String rideId) {
        log.info("Request received to start ride '{}'", rideId);
        RideDTO updatedRide = rideService.startRide(rideId); // Service returns RideDTO
        return ResponseEntity.ok(updatedRide); // Return DTO
    }

    /**
     * Endpoint for the driver to complete their active ride.
     * Accessible only by DRIVER role.
     * @param rideId The ID of the ride to complete.
     * @return ResponseEntity containing the updated RideDTO or error.
     */
    @PutMapping("/{rideId}/complete") // Use PUT for state change
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<RideDTO> completeRide(@PathVariable String rideId) {
        log.info("Request received to complete ride '{}'", rideId);
        RideDTO updatedRide = rideService.completeRide(rideId); // Service returns RideDTO
        return ResponseEntity.ok(updatedRide); // Return DTO
    }

    /**
     * Endpoint for the driver to cancel their ride.
     * Accessible only by DRIVER role.
     * @param rideId The ID of the ride to cancel.
     * @return ResponseEntity with No Content (204) on success or error.
     */
    @PutMapping("/{rideId}/cancel") // Use PUT for state change to cancelled
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> cancelRideByDriver(@PathVariable String rideId) {
        log.info("Request received to cancel ride '{}' by driver", rideId);
        rideService.cancelRideByDriver(rideId); // Service is void
        return ResponseEntity.noContent().build(); // Return 204 No Content
    }



    /**
     * Placeholder for fetching ride history for the authenticated user.
     * Accessible by PASSENGER and DRIVER roles.
     *
     * @return Placeholder response.
     */
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('PASSENGER', 'DRIVER')")
    public ResponseEntity<String> rideHistory() {
        // Implement logic to fetch ride history based on authenticated user's ID
        // This will likely involve querying both RideRepository (for rides driven)
        // and BookingRepository (for rides taken as passenger) using RideService/BookingService.
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        log.info("User '{}' requested ride history (placeholder).", authentication.getName());
        return ResponseEntity.ok("Your ride history (both as rider or driver) (placeholder).");
    }
}