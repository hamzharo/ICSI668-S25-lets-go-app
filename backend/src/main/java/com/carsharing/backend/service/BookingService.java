package com.carsharing.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
<<<<<<< HEAD
import java.util.List; // Keep this import

=======
import java.util.Collections;
>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)
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
import com.carsharing.backend.model.RideStatus;
import com.carsharing.backend.model.User;
import com.carsharing.backend.repository.BookingRepository;
import com.carsharing.backend.repository.RideRepository;
import com.carsharing.backend.repository.UserRepository;

<<<<<<< HEAD
=======

import com.carsharing.backend.model.BookingStatus;
>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)
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

<<<<<<< HEAD
    public static final String STATUS_REQUESTED = "REQUESTED";
    public static final String STATUS_CONFIRMED = "CONFIRMED";
    public static final String STATUS_REJECTED_BY_DRIVER = "REJECTED_BY_DRIVER";
    public static final String STATUS_CANCELLED_BY_PASSENGER = "CANCELLED_BY_PASSENGER"; 
    public static final String STATUS_CANCELLED_BY_DRIVER = "CANCELLED_BY_DRIVER"; // Likely needed later
    public static final String STATUS_COMPLETED = "COMPLETED"; // Likely needed later
   
    
  // Define states from which a passenger can cancel 
  public static final Set<String> CANCELLABLE_STATES_BY_PASSENGER = Set.of(
    STATUS_REQUESTED, STATUS_CONFIRMED
);
// Define states considered 'active' or 'pending' for ride cancellation impact 
public static final Set<String> ACTIVE_BOOKING_STATES = Set.of(
    STATUS_REQUESTED, STATUS_CONFIRMED
);
=======
    // private static final String STATUS_REQUESTED = "REQUESTED";
    // private static final String STATUS_CONFIRMED = "CONFIRMED";
    // private static final String STATUS_REJECTED_BY_DRIVER = "REJECTED_BY_DRIVER";
>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

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
         if (ride.getStatus() != RideStatus.SCHEDULED) { // Use Enum later
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
<<<<<<< HEAD
        // ride.setUpdatedAt(LocalDateTime.now()); // Let Auditing handle
        rideRepository.save(ride); // Save the updated ride first

=======
        rideRepository.save(ride); 
        
>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)
        // 5. Create Booking
        Booking newBooking = new Booking();
        newBooking.setRideId(rideId);
        newBooking.setPassengerId(passenger.getId());
        newBooking.setDriverId(ride.getDriverId()); // Store driver ID for convenience
        newBooking.setRequestedSeats(requested);
<<<<<<< HEAD
        newBooking.setStatus("REQUESTED"); // Initial status, Use Enum later
        newBooking.setCreatedAt(LocalDateTime.now()); // Let Auditing handle

=======
        newBooking.setStatus(BookingStatus.REQUESTED); // Initial status, Use Enum later
        // newBooking.setCreatedAt(LocalDateTime.now()); // Let Auditing handle
        // newBooking.setUpdatedAt(LocalDateTime.now()); // Let Auditing handle
>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)


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
<<<<<<< HEAD
        validateBookingStatus(booking, STATUS_REQUESTED, "confirm");

        // 4. Update Status
        booking.setStatus(STATUS_CONFIRMED);
=======
        validateBookingStatus(booking, BookingStatus.REQUESTED, "confirm"); // <-- Use Enum

        // 4. Update Status
        // booking.setStatus(STATUS_CONFIRMED);
        booking.setStatus(BookingStatus.CONFIRMED); // <-- Use Enum
>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)
        booking.setConfirmationTime(LocalDateTime.now()); // Set confirmation time
        // Let auditing handle updatedAt

        // 5. Save and Return
        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Booking ID: {} confirmed successfully by driver '{}'", bookingId, driverEmail);

        // Send notification to Passenger
<<<<<<< HEAD
=======
        String confirmationPayload = String.format(
            "Your booking request for ride %s has been CONFIRMED by the driver.",
            updatedBooking.getRideId()
        );
        try {
            // Use the specific passenger ID from the updated booking
            notificationService.notifyUserBookingUpdate(updatedBooking.getPassengerId(), confirmationPayload);
        } catch (Exception e) {
            log.error(
                "Failed to send booking confirmation notification to passenger ID {}: {}",
                updatedBooking.getPassengerId(),
                e.getMessage()
            );
        }
>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)

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
<<<<<<< HEAD
        validateBookingStatus(booking, STATUS_REQUESTED, "reject");

        // 4. Update Booking Status
        booking.setStatus(STATUS_REJECTED_BY_DRIVER);
=======
        // validateBookingStatus(booking, STATUS_REQUESTED, "reject");
        validateBookingStatus(booking, BookingStatus.REQUESTED, "reject"); // <-- Use Enum

        // 4. Update Booking Status
        // booking.setStatus(STATUS_REJECTED_BY_DRIVER);
        booking.setStatus(BookingStatus.REJECTED_BY_DRIVER); // <-- Use Enum
>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)
        booking.setCancellationTime(LocalDateTime.now()); // Use cancellation time for rejection too
         // Let auditing handle updatedAt

        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Booking ID: {} rejected successfully by driver '{}'", bookingId, driverEmail);

        // 5. IMPORTANT: Increment available seats back on the Ride
        incrementAvailableSeats(booking.getRideId(), booking.getRequestedSeats());

        //Send notification to Passenger
<<<<<<< HEAD

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
=======
        String rejectionPayload = String.format(
            "Unfortunately, your booking request for ride %s was REJECTED by the driver.",
            updatedBooking.getRideId()
        );
         try {
             // Use the specific passenger ID from the updated booking
            notificationService.notifyUserBookingUpdate(updatedBooking.getPassengerId(), rejectionPayload);
        } catch (Exception e) {
            log.error(
                "Failed to send booking rejection notification to passenger ID {}: {}",
                updatedBooking.getPassengerId(),
                e.getMessage()
            );
        }
        // End of notification block
        return updatedBooking;
    }

    // --- Helper Methods ---

>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private Booking findBookingById(String bookingId) {
<<<<<<< HEAD
=======
        // log.info(">>> findBookingById called with ID: [{}]", bookingId);
>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)
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

<<<<<<< HEAD
    private void validateBookingStatus(Booking booking, String expectedStatus, String action) {
        // Ensure the booking is in the correct state for the action
        if (!expectedStatus.equalsIgnoreCase(booking.getStatus())) {
=======
    private void validateBookingStatus(Booking booking, BookingStatus  expectedStatus, String action) {
        // Ensure the booking is in the correct state for the action
        if (booking.getStatus() != expectedStatus) {
>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)
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

<<<<<<< HEAD
    // --- Methods for listing requests etc. will go here later ---

=======
   /**
 * Cancels all active (REQUESTED or CONFIRMED) bookings associated with a given ride ID.
 * Typically called when a driver cancels the entire ride.
 * It also increments the available seats back on the ride for each affected booking.
 *
 * @param rideId The ID of the ride being cancelled.
 * @param cancellationStatus The status to set on the cancelled bookings (e.g., CANCELLED_BY_DRIVER).
 */
@Transactional // Ensure atomicity across multiple bookings and the ride update
public void cancelBookingsForRide(String rideId, BookingStatus cancellationStatus) {
    log.info("Attempting to cancel bookings for cancelled ride ID: {} with status: {}", rideId, cancellationStatus);

    // Find bookings for this ride that are in a state needing cancellation
    List<BookingStatus> statusesToCancel = List.of(BookingStatus.REQUESTED, BookingStatus.CONFIRMED);
    List<Booking> bookingsToCancel = bookingRepository.findByRideIdAndStatusIn(rideId, statusesToCancel);

    if (bookingsToCancel.isEmpty()) {
        log.info("No active bookings found for ride ID {} to cancel.", rideId);
        return; // Nothing to do
    }

    log.info("Found {} bookings to cancel for ride ID: {}", bookingsToCancel.size(), rideId);

    int totalSeatsToRestore = 0;
    LocalDateTime cancellationTime = LocalDateTime.now();

    // Update status and calculate seats to restore
    for (Booking booking : bookingsToCancel) {
        // Only restore seats if the booking was actually holding them (e.g., CONFIRMED, or maybe REQUESTED depending on your logic in requestBooking)
        // Based on your current requestBooking logic, seats are decremented immediately.
        if (booking.getStatus() == BookingStatus.REQUESTED || booking.getStatus() == BookingStatus.CONFIRMED) {
             totalSeatsToRestore += booking.getRequestedSeats();
        }
        booking.setStatus(cancellationStatus);
        booking.setCancellationTime(cancellationTime); // Set cancellation time
        // Let auditing handle updatedAt

        // Send notification to passenger
        // Consider creating a simple payload DTO or just sending a message String
        String notificationPayload = String.format("Your booking for ride %s was cancelled because the ride was cancelled by the driver.", rideId);
        try {
            notificationService.notifyUserBookingUpdate(booking.getPassengerId(), notificationPayload);
        } catch (Exception e) {
            // Log error but don't let notification failure stop the cancellation process
            log.error("Failed to send cancellation notification to passenger ID {}: {}", booking.getPassengerId(), e.getMessage());
        }
    }

    // Save all updated bookings
    bookingRepository.saveAll(bookingsToCancel);
    log.info("Updated status for {} bookings for ride ID: {}", bookingsToCancel.size(), rideId);

    // Increment available seats back on the Ride *after* processing bookings
    if (totalSeatsToRestore > 0) {
        try {
            // Use the helper method if it fits, or re-implement logic safely
            incrementAvailableSeats(rideId, totalSeatsToRestore);
        } catch (Exception e) {
            // Log error but the bookings are already cancelled. Ride seat count might be inconsistent.
            log.error("Failed to increment available seats back on ride ID {} after cancelling bookings: {}", rideId, e.getMessage());
            // Consider adding more robust error handling or retry logic if seat count is critical
        }
    }
}

 // **** START OF NEW METHOD TO ADD ****
 public void notifyPassengersOfRideUpdate(String rideId, String message) {
    // Find all CONFIRMED bookings for this ride
    // Make sure your BookingRepository has a method like findByRideIdAndStatusIn or adapt accordingly
    List<Booking> confirmedBookings = bookingRepository.findByRideIdAndStatusIn(
        rideId,
        Collections.singletonList(BookingStatus.CONFIRMED)
    );

    if (confirmedBookings.isEmpty()) {
        log.info("No confirmed passengers to notify for ride update: {} (Ride ID)", rideId);
        return;
    }

    log.info("Notifying {} confirmed passengers about update to ride: {} (Ride ID)", confirmedBookings.size(), rideId);
    for (Booking booking : confirmedBookings) {
        // Assuming your User model (linked via passengerId) has an email or a way to get a user-specific topic.
        // And assuming Booking model has a getPassengerId() method that returns the User's ID.
        String passengerUserId = booking.getPassengerId(); // This needs to be the actual User ID for notification

        // Re-check your NotificationService's sendBookingUpdateNotification method signature.
        // It might expect a User object, user ID, or user email.
        // Let's assume it takes passengerUserId, bookingId, current booking status, and a custom message.
        notificationService.sendBookingUpdateNotification(
            passengerUserId,
            booking.getId(),
            booking.getStatus(), // The booking status itself hasn't changed, but the ride it's for has.
            message
        );
        // Example if your notification service sends to a specific user queue and needs the user's email principal
        // User passenger = userRepository.findById(passengerUserId).orElse(null);
        // if (passenger != null) {
        //     notificationService.sendPrivateNotification(passenger.getEmail(), "Your booked ride " + rideId + " has been updated: " + message);
        // }
    }
}
// **** END OF NEW METHOD TO ADD ****
>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)

}