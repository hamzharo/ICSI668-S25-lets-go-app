package com.carsharing.backend.controller;

import com.carsharing.backend.exception.BookingException;
import com.carsharing.backend.exception.ResourceNotFoundException;
import com.carsharing.backend.service.BookingService;

import com.carsharing.backend.service.UserService; // Import UserService
import com.carsharing.backend.model.User; // Import User
import com.carsharing.backend.dto.BookingDTO;
import com.carsharing.backend.exception.ActionNotAllowedException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*; 
import java.util.List; 


@RestController
@RequestMapping("/api/passenger") // Base path for passenger-specific actions
@PreAuthorize("hasRole('PASSENGER')") // All endpoints here require PASSENGER role
public class PassengerController {

    private static final Logger log = LoggerFactory.getLogger(PassengerController.class);

    @Autowired
    private BookingService bookingService;

    @Autowired 
    private UserService userService;


@PostMapping("/apply-driver") 
    public ResponseEntity<?> applyForDriverRole() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String passengerEmail = authentication.getName();
            log.info("Passenger '{}' requesting to apply for driver role.", passengerEmail);

            User updatedUser = userService.applyForDriverRole(passengerEmail);
             // IMPORTANT: Return a DTO here to avoid exposing password hash!
            // For now, returning partial info for simplicity. Replace with DTO.
            UserProfileDTO profile = new UserProfileDTO(updatedUser.getId(), updatedUser.getName(), updatedUser.getEmail(), updatedUser.getRoles(), updatedUser.getDriverStatus()); // Pass status
            return ResponseEntity.ok(profile);

        } catch (ResourceNotFoundException e) {
             log.warn("Apply driver role failed: {}", e.getMessage());
             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (ActionNotAllowedException e) {
            log.warn("Apply driver role failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error during driver application: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body("An unexpected error occurred during the driver application process.");
        }
    }

       // --- Added UserProfileDTO as inner class for simplicity ---
     // Ideally, move this to your dto package
     // Make sure it includes the driverStatus field
     public static class UserProfileDTO {
        public String id;
        public String name;
        public String email;
        public List<String> roles;
        public String driverStatus; // Added field

        public UserProfileDTO(String id, String name, String email, List<String> roles, String driverStatus) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.roles = roles;
            this.driverStatus = driverStatus; // Added assignment
        }
        // Add getters if needed
    }
        /**
     * Endpoint for a passenger to retrieve a list of bookings they have made.
     * @return ResponseEntity containing a list of the passenger's bookings or error status.
     */
    @GetMapping("/my-bookings") // 
    public ResponseEntity<?> getMyBookings() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String passengerEmail = authentication.getName();
            log.info("Passenger '{}' requesting their bookings.", passengerEmail);

            List<BookingDTO> bookingDTOs = bookingService.findBookingsByPassengerEmail(passengerEmail);

            if (bookingDTOs.isEmpty()) {
                log.info("No bookings found for passenger '{}'.", passengerEmail);
               return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 if no bookings
           }

           log.info("Returning {} bookings for passenger '{}'.", bookingDTOs.size(), passengerEmail);
            return ResponseEntity.ok(bookingDTOs);

            // return ResponseEntity.ok(bookingDTOs); // 200 OK with list

            
        } catch (ResourceNotFoundException e) {
            // Shouldn't happen if token valid, but handle defensively
             log.warn("Get my bookings failed: {}", e.getMessage());
             return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Error fetching bookings for current passenger: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Add endpoint GET /my-bookings to view own bookings

    /**
     * Endpoint for a passenger to cancel their own booking.
     * @param bookingId The ID of the booking to cancel.
     * @return ResponseEntity with the updated (cancelled) Booking details or error status.
     */
    @DeleteMapping("/bookings/{bookingId}") // Using DELETE for cancelling own booking
    public ResponseEntity<?> cancelMyBooking(@PathVariable String bookingId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String passengerEmail = authentication.getName();

            BookingDTO cancelledBookingDTO = bookingService.cancelBookingByPassenger(bookingId, passengerEmail);
            // Return 200 OK with the updated booking details
            return ResponseEntity.ok(cancelledBookingDTO);

        } catch (ResourceNotFoundException e) {
            log.warn("Cancel booking failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (BookingException e) {
            log.warn("Cancel booking failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (AccessDeniedException e) {
            log.warn("Cancel booking failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error cancelling booking {}: {}", bookingId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body("An unexpected error occurred while cancelling the booking.");
        }
    }

}