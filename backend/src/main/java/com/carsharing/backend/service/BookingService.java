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
import java.util.Arrays; // Import Arrays
import java.util.Set; // Import Set
import java.util.stream.Collectors; // Import Collectors
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
    private static final String STATUS_CANCELLED_BY_PASSENGER = "CANCELLED_BY_PASSENGER"; 
    //private static final String STATUS_CANCELLED_BY_DRIVER = "CANCELLED_BY_DRIVER"; // Likely needed later
    //private static final String STATUS_COMPLETED = "COMPLETED"; // Likely needed later
   
    // Define states from which a passenger can cancel
   private static final Set<String> CANCELLABLE_STATES_BY_PASSENGER = Set.of(
    STATUS_REQUESTED, STATUS_CONFIRMED
   );


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
        rideRepository.save(ride); // Save the updated ride first

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

  //  PASSENGER CANCELLATION ---
    @Transactional
    public Booking cancelBookingByPassenger(String bookingId, String passengerEmail) {
        log.info("Passenger '{}' attempting to cancel booking ID: {}", passengerEmail, bookingId);

        // 1. Find Passenger User
        User passenger = findUserByEmail(passengerEmail);

        // 2. Find Booking
        Booking booking = findBookingById(bookingId);

        // 3. Validation
        // Check ownership
        if (!Objects.equals(booking.getPassengerId(), passenger.getId())) {
            log.warn("Authorization failed: Passenger '{}' (ID: {}) attempted to cancel booking ID: {} owned by passenger ID: {}",
                     passenger.getEmail(), passenger.getId(), booking.getId(), booking.getPassengerId());
            throw new AccessDeniedException("You are not authorized to cancel this booking.");
        }

        // Check if booking is in a cancellable state
        if (!CANCELLABLE_STATES_BY_PASSENGER.contains(booking.getStatus())) {
             log.warn("Action 'cancel' failed for booking ID: {}. Status '{}' is not cancellable by passenger. Allowed states: {}",
                     booking.getId(), booking.getStatus(), CANCELLABLE_STATES_BY_PASSENGER);
            throw new BookingException(String.format(
                    "Cannot cancel booking. Current status is '%s'. Cancellable states are: %s.",
                     booking.getStatus(), CANCELLABLE_STATES_BY_PASSENGER
            ));
        }

        // Optional: Add time-based validation here (e.g., cannot cancel within X hours of departure)
        // Ride rideForTimeCheck = rideRepository.findById(booking.getRideId()).orElse(null);
        // if (rideForTimeCheck != null && LocalDateTime.now().isAfter(rideForTimeCheck.getDepartureTime().minusHours(2))) {
        //     throw new BookingException("Cannot cancel booking less than 2 hours before departure.");
        // }

        // 4. Determine if seats need to be incremented
        boolean wasConfirmed = STATUS_CONFIRMED.equalsIgnoreCase(booking.getStatus());

        // 5. Update Booking Status
        booking.setStatus(STATUS_CANCELLED_BY_PASSENGER);
        booking.setCancellationTime(LocalDateTime.now());
        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Booking ID: {} cancelled successfully by passenger '{}'", bookingId, passengerEmail);

        // 6. Increment seats back ONLY if the booking was previously confirmed
        if (wasConfirmed) {
            incrementAvailableSeats(booking.getRideId(), booking.getRequestedSeats());
        } else {
            log.info("Seats not incremented for ride ID: {} as cancelled booking was not in CONFIRMED state.", booking.getRideId());
        }

        // Send notification to Driver about cancellation

        return updatedBooking;
    }

/**
     * Finds all bookings made by the passenger associated with the given email.
     * @param passengerEmail The email of the passenger.
     * @return A list of bookings made by the passenger.
     * @throws ResourceNotFoundException if the user is not found.
     */
    public List<Booking> findBookingsByPassengerEmail(String passengerEmail) {
        // Find the user first to get their ID
        User passenger = findUserByEmail(passengerEmail); // Reuse existing helper

        log.info("Fetching bookings for passenger ID: {}", passenger.getId());
        // Use the existing repository method that finds by passengerId
        List<Booking> bookings = bookingRepository.findByPassengerId(passenger.getId());
        log.info("Found {} bookings for passenger ID: {}", bookings.size(), passenger.getId());
        return bookings;
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