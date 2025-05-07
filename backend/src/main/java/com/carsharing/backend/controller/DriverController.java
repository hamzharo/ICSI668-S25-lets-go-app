package com.carsharing.backend.controller;

import com.carsharing.backend.dto.BookingDTO;
import com.carsharing.backend.dto.RideCreationDTO;
import com.carsharing.backend.dto.RideDTO; // Assuming RideDTO is used as a return type by RideService
import com.carsharing.backend.dto.RideUpdateDTO;
import com.carsharing.backend.exception.BookingException;
import com.carsharing.backend.exception.IllegalRideStateException;
import com.carsharing.backend.exception.ResourceNotFoundException;
import com.carsharing.backend.exception.UnauthorizedOperationException;
// import com.carsharing.backend.model.Booking;
// import com.carsharing.backend.model.Ride; // Only needed if service returns Ride entity, prefer DTO
import com.carsharing.backend.service.BookingService;
import com.carsharing.backend.service.RideService;
import jakarta.validation.Valid;
import lombok.Data; // If you are using @Data for the class
// import lombok.Getter; // @Data includes @Getter
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.AccessDeniedException; // Keep if used by existing methods
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Data // If you want Lombok to generate constructor, getters, setters, toString, equals, hashCode
@RestController
@RequestMapping("/api/driver")
@PreAuthorize("hasRole('DRIVER')")
public class DriverController {

    private static final Logger log = LoggerFactory.getLogger(DriverController.class);

    private final RideService rideService;
    private final BookingService bookingService;

    // Constructor Injection is generally preferred
    @Autowired
    public DriverController(RideService rideService, BookingService bookingService) {
        this.rideService = rideService;
        this.bookingService = bookingService;
    }

    // --- Ride Management ---
    @GetMapping("/my-rides")
    public ResponseEntity<?> getMyRides() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String driverEmail = authentication.getName();
            log.info("Driver '{}' requesting their offered rides.", driverEmail);

            // Assuming rideService.findRidesByDriverEmail returns List<RideDTO>
            List<RideDTO> rides = rideService.findRidesByDriverEmail(driverEmail);

            if (rides.isEmpty()) {
                log.info("No rides found for driver '{}'.", driverEmail);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            log.info("Returning {} rides for driver '{}'.", rides.size(), driverEmail);
            return ResponseEntity.ok(rides);

        } catch (ResourceNotFoundException e) {
            log.warn("Get my rides failed for user {}: {}", SecurityContextHolder.getContext().getAuthentication().getName(), e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error fetching rides for current driver: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while retrieving your rides.");
        }
    }

    @PostMapping("/offer-ride")
    public ResponseEntity<?> createRide(@Valid @RequestBody RideCreationDTO rideCreationDTO) { // Added @Valid
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String driverEmail = authentication.getName();
            log.info("Driver '{}' attempting to create a new ride.", driverEmail);

            RideDTO createdRide = rideService.createRide(rideCreationDTO, driverEmail);

            log.info("Ride created successfully with ID: {}", createdRide.getId());
            return new ResponseEntity<>(createdRide, HttpStatus.CREATED);
 
        } catch (ResourceNotFoundException e) {
            log.warn("Failed to create ride for user {}: {}", SecurityContextHolder.getContext().getAuthentication().getName(), e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) { // Catch validation errors from service or DTO
             log.warn("Failed to create ride due to invalid data for user {}: {}", SecurityContextHolder.getContext().getAuthentication().getName(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
        catch (Exception e) {
            log.error("Error creating ride for user {}: {}", SecurityContextHolder.getContext().getAuthentication().getName(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while creating the ride.");
        }
    }

    // --- THIS IS THE NEW/UPDATED RIDE UPDATE METHOD ---
    @PutMapping("/rides/{rideId}") // Changed path for consistency
    public ResponseEntity<?> updateRide(
            @PathVariable String rideId,
            @RequestBody @Valid RideUpdateDTO rideUpdateDTO) {
        try {
            // The RideService.updateRide method will handle fetching the authenticated driver
            RideDTO updatedRide = rideService.updateRide(rideId, rideUpdateDTO);
            log.info("Ride '{}' updated successfully by driver.", rideId);
            return ResponseEntity.ok(updatedRide);
        } catch (ResourceNotFoundException e) {
            log.warn("Update ride failed for ride '{}': {}", rideId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalRideStateException e) {
            log.warn("Update ride failed for ride '{}' due to illegal state: {}", rideId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (UnauthorizedOperationException e) {
            log.warn("Update ride failed for ride '{}' due to unauthorized access: {}", rideId, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("Update ride failed due to invalid data for ride '{}': {}", rideId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error updating ride '{}': {}", rideId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body("An unexpected error occurred while updating the ride.");
        }
    }

    // This endpoint seems to be handled by RideController.cancelRideByDriver now,
    // which is PUT /api/rides/{rideId}/cancel.
    // If you need a driver-specific delete that does something different, you can keep it,
    // otherwise, it might be redundant. For now, I'll keep your existing logic structure
    // but ensure it calls the correct service method if cancelRideByDriver in RideService expects driverEmail.
    @DeleteMapping("/delete-ride/{id}") // Consider renaming to /rides/{id} for consistency
    public ResponseEntity<?> deleteRide(@PathVariable String id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String driverEmail = authentication.getName(); // Assuming service needs driver email for auth

            // Assuming rideService.cancelRideByDriver now handles cancellation.
            // If your RideService.cancelRideByDriver takes driverEmail for auth:
            // rideService.cancelRideByDriver(id, driverEmail);
            // If RideService.cancelRideByDriver takes only rideId and auth is internal:
            rideService.cancelRideByDriver(id); // This was how we defined it earlier

            log.info("Ride '{}' cancelled by driver '{}'.", id, driverEmail);
            return ResponseEntity.noContent().build();

        } catch (ResourceNotFoundException e) {
            log.warn("Cancel ride failed for ride {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalRideStateException e) { // Use IllegalRideStateException
            log.warn("Cancel ride failed for ride {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (UnauthorizedOperationException e) { // Use UnauthorizedOperationException
            log.warn("Cancel ride failed for ride {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
        catch (Exception e) {
            log.error("Error cancelling ride {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while cancelling the ride.");
        }
    }

    // --- Booking Management by Driver ---

    // Implement GET /ride-requests using BookingService
    // This endpoint would list booking requests for rides offered by the current driver.
    // @GetMapping("/ride-requests")
    // public ResponseEntity<?> viewRideRequests() {
    //     try {
    //         Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    //         String driverEmail = authentication.getName();
    //         log.info("Driver '{}' fetching ride requests for their rides.", driverEmail);
    //         List<BookingDTO> requests = bookingService.getPendingBookingsForDriver(driverEmail); // Assuming BookingService has this & returns DTOs
    //         if (requests.isEmpty()) {
    //             return ResponseEntity.noContent().build();
    //         }
    //         return ResponseEntity.ok(requests);
    //     } catch (Exception e) {
    //         log.error("Error fetching ride requests for driver: {}", e.getMessage(), e);
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch ride requests.");
    //     }
    // }


    @PostMapping("/bookings/{bookingId}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable String bookingId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String driverEmail = authentication.getName(); // For authorization check in service

            BookingDTO confirmedBookingDTO = bookingService.confirmBooking(bookingId, driverEmail);
            // Consider returning a BookingDTO instead of the Booking entity directly
            return ResponseEntity.ok(confirmedBookingDTO);

        } catch (ResourceNotFoundException e) {
            log.warn("Confirm booking failed for booking {}: {}", bookingId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (BookingException | IllegalStateException e) { // Catch BookingException or general state issues
            log.warn("Confirm booking failed for booking {}: {}", bookingId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (UnauthorizedOperationException e) { // Ensure this exception type is used by BookingService
            log.warn("Confirm booking failed for booking {} (unauthorized): {}", bookingId, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error confirming booking {}: {}", bookingId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while confirming the booking.");
        }
    }

    @PostMapping("/bookings/{bookingId}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable String bookingId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String driverEmail = authentication.getName(); // For authorization check in service

            BookingDTO rejectedBookingDTO = bookingService.rejectBooking(bookingId, driverEmail);
            // Consider returning a BookingDTO
            return ResponseEntity.ok(rejectedBookingDTO);

        } catch (ResourceNotFoundException e) {
            log.warn("Reject booking failed for booking {}: {}", bookingId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (BookingException | IllegalStateException e) {
            log.warn("Reject booking failed for booking {}: {}", bookingId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (UnauthorizedOperationException e) { // Ensure this exception type is used by BookingService
            log.warn("Reject booking failed for booking {} (unauthorized): {}", bookingId, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error rejecting booking {}: {}", bookingId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while rejecting the booking.");
        }
    }
}