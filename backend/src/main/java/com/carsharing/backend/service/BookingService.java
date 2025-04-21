package com.carsharing.backend.service;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.List; // Keep this import

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Important here

import com.carsharing.backend.dto.BookingRequestDTO;
import com.carsharing.backend.exception.BookingException; // Create this custom exception
import com.carsharing.backend.exception.ResourceNotFoundException;
import com.carsharing.backend.model.Booking;
import com.carsharing.backend.model.Ride;
import com.carsharing.backend.model.User;
import com.carsharing.backend.repository.BookingRepository;
import com.carsharing.backend.repository.RideRepository;
import com.carsharing.backend.repository.UserRepository;

import org.springframework.security.access.AccessDeniedException;




import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@ToString
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
@Data
@Setter
@Getter
@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private static final String STATUS_REQUESTED = "REQUESTED";
    private static final String STATUS_CONFIRMED = "CONFIRMED";
    private static final String STATUS_REJECTED_BY_DRIVER = "REJECTED_BY_DRIVER";

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional // Use transaction to ensure Ride update and Booking creation succeed or fail together
    public Booking requestBooking(String rideId, BookingRequestDTO bookingRequestDTO, String passengerEmail) {

        // 1. Find Passenger
        User passenger = userRepository.findByEmail(passengerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Passenger not found with email: " + passengerEmail));

        // 2. Find Ride
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with ID: " + rideId));

        // 3. --- Validation ---
        // Check if passenger is trying to book their own ride
        if (Objects.equals(ride.getDriverId(), passenger.getId())) {
            throw new BookingException("Driver cannot book their own ride.");
        }
        // Check if ride is still scheduled
        if (!"SCHEDULED".equalsIgnoreCase(ride.getStatus())) { // Use Enum later
             throw new BookingException("Cannot book ride, status is not SCHEDULED (Status: " + ride.getStatus() + ")");
        }
         // Check if ride departure time is in the past
        if (ride.getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new BookingException("Cannot book ride, departure time is in the past.");
        }
        // Check requested seats
        int requested = bookingRequestDTO.getRequestedSeats();
        if (requested <= 0) {
             throw new BookingException("Requested seats must be positive.");
        }
        // Check available seats
        if (ride.getAvailableSeats() < requested) {
            throw new BookingException(String.format(
                    "Not enough available seats. Requested: %d, Available: %d",
                    requested, ride.getAvailableSeats()));
        }
        // Check if passenger already booked this ride (prevent double booking)
        // Add a check here later if needed

        // 4. Update Ride: Decrement available seats
        ride.setAvailableSeats(ride.getAvailableSeats() - requested);
        // ride.setUpdatedAt(LocalDateTime.now()); // Let Auditing handle
        Ride updatedRide = rideRepository.save(ride); // Save the updated ride first

        // 5. Create Booking
        Booking newBooking = new Booking();
        newBooking.setRideId(rideId);
        newBooking.setPassengerId(passenger.getId());
        newBooking.setDriverId(ride.getDriverId()); // Store driver ID for convenience
        newBooking.setRequestedSeats(requested);
        newBooking.setStatus("REQUESTED"); // Initial status, Use Enum later
        // newBooking.setCreatedAt(LocalDateTime.now()); // Let Auditing handle
        // newBooking.setUpdatedAt(LocalDateTime.now()); // Let Auditing handle


        Booking savedBooking = bookingRepository.save(newBooking);

        log.info("Booking request successful for ride ID: {} by passenger: {}. Booking ID: {}",
                rideId, passengerEmail, savedBooking.getId());

        // Send notification to Driver later

        return savedBooking;
    }
    
    //METHODS FOR CONFIRMATION/REJECTION ---
    @Transactional
    public Booking confirmBooking(String bookingId, String driverEmail) {
        log.info("Driver '{}' attempting to confirm booking ID: {}", driverEmail, bookingId);
        // 1. Find Driver User
        User driver = findUserByEmail(driverEmail);

        // 2. Find Booking
        Booking booking = findBookingById(bookingId);

        // 3. Validation
        validateDriverOwnership(booking, driver);
        validateBookingStatus(booking, STATUS_REQUESTED, "confirm");

        // 4. Update Status
        booking.setStatus(STATUS_CONFIRMED);
        booking.setConfirmationTime(LocalDateTime.now()); // Set confirmation time
        // Let auditing handle updatedAt

        // 5. Save and Return
        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Booking ID: {} confirmed successfully by driver '{}'", bookingId, driverEmail);

        // Send notification to Passenger

        return updatedBooking;
    }

    @Transactional // Crucial because we modify Ride as well
    public Booking rejectBooking(String bookingId, String driverEmail) {
        log.info("Driver '{}' attempting to reject booking ID: {}", driverEmail, bookingId);
        // 1. Find Driver User
        User driver = findUserByEmail(driverEmail);

        // 2. Find Booking
        Booking booking = findBookingById(bookingId);

        // 3. Validation
        validateDriverOwnership(booking, driver);
        validateBookingStatus(booking, STATUS_REQUESTED, "reject");

        // 4. Update Booking Status
        booking.setStatus(STATUS_REJECTED_BY_DRIVER);
        booking.setCancellationTime(LocalDateTime.now()); // Use cancellation time for rejection too
         // Let auditing handle updatedAt

        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Booking ID: {} rejected successfully by driver '{}'", bookingId, driverEmail);

        // 5. IMPORTANT: Increment available seats back on the Ride
        incrementAvailableSeats(booking.getRideId(), booking.getRequestedSeats());

        //Send notification to Passenger

        return updatedBooking;
    }

    // --- Helper Methods ---

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private Booking findBookingById(String bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
    }

    private void validateDriverOwnership(Booking booking, User driver) {
        // Ensure the authenticated user is the driver associated with the booking
        if (!Objects.equals(booking.getDriverId(), driver.getId())) {
            log.warn("Authorization failed: Driver '{}' (ID: {}) attempted to access booking ID: {} owned by driver ID: {}",
                     driver.getEmail(), driver.getId(), booking.getId(), booking.getDriverId());
            throw new AccessDeniedException("You are not authorized to manage this booking."); // Use Spring Security's exception
        }
    }

    private void validateBookingStatus(Booking booking, String expectedStatus, String action) {
        // Ensure the booking is in the correct state for the action
        if (!expectedStatus.equalsIgnoreCase(booking.getStatus())) {
            log.warn("Action '{}' failed for booking ID: {}. Expected status '{}', but was '{}'",
                     action, booking.getId(), expectedStatus, booking.getStatus());
            throw new BookingException(String.format(
                    "Cannot %s booking. Current status is '%s', expected '%s'.",
                    action, booking.getStatus(), expectedStatus
            ));
        }
    }

     private void incrementAvailableSeats(String rideId, int seatsToIncrement) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> {
                     // This should ideally not happen if the booking existed, but good practice to handle
                     log.error("Consistency Error: Ride not found with ID {} while trying to increment seats for rejected booking.", rideId);
                     return new ResourceNotFoundException("Associated ride not found with ID: " + rideId);
                });

        // Ensure we don't exceed total seats (safety check)
        int newSeatCount = Math.min(ride.getTotalSeats(), ride.getAvailableSeats() + seatsToIncrement);
        ride.setAvailableSeats(newSeatCount);
        rideRepository.save(ride);
        log.info("Incremented available seats for ride ID: {} by {} (New count: {})", rideId, seatsToIncrement, newSeatCount);
    }

    // --- Methods for listing requests etc. will go here later ---


}