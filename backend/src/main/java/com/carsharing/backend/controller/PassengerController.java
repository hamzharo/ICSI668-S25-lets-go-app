package com.carsharing.backend.controller;

import com.carsharing.backend.exception.BookingException;
import com.carsharing.backend.exception.ResourceNotFoundException;
import com.carsharing.backend.model.Booking;
import com.carsharing.backend.service.BookingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*; // Import DeleteMapping etc.

@RestController
@RequestMapping("/api/passenger") // Base path for passenger-specific actions
@PreAuthorize("hasRole('PASSENGER')") // All endpoints here require PASSENGER role
public class PassengerController {

    private static final Logger log = LoggerFactory.getLogger(PassengerController.class);

    @Autowired
    private BookingService bookingService;

    // --- Booking Management ---

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

            Booking cancelledBooking = bookingService.cancelBookingByPassenger(bookingId, passengerEmail);
            // Return 200 OK with the updated booking details
            return ResponseEntity.ok(cancelledBooking);

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