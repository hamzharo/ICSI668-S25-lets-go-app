package com.carsharing.backend.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
<<<<<<< HEAD
import java.util.Objects; 

=======
import java.util.stream.Collectors;
>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import com.carsharing.backend.dto.RideCreationDTO;
<<<<<<< HEAD
import com.carsharing.backend.dto.RideUpdateDTO; 
import com.carsharing.backend.exception.BookingException;
import com.carsharing.backend.exception.ResourceNotFoundException;
import com.carsharing.backend.model.Booking; 
=======
import com.carsharing.backend.exception.IllegalRideStateException;
import com.carsharing.backend.exception.ResourceNotFoundException;
import com.carsharing.backend.exception.UnauthorizedOperationException;
import com.carsharing.backend.model.BookingStatus;
>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)
import com.carsharing.backend.model.Ride;
import com.carsharing.backend.model.User;
import com.carsharing.backend.repository.BookingRepository;
import com.carsharing.backend.repository.RideRepository;
import com.carsharing.backend.repository.UserRepository;
import com.carsharing.backend.model.RideStatus;
import com.carsharing.backend.util.AuthenticationUtil;
import com.carsharing.backend.dto.RideDTO; 
import com.carsharing.backend.dto.RideUpdateDTO; 



// import lombok.AllArgsConstructor;
// import lombok.Data;
// import lombok.EqualsAndHashCode;
// import lombok.Getter;
// import lombok.NoArgsConstructor;
// import lombok.Setter;
// import lombok.ToString;


// @ToString
// @Setter
// @EqualsAndHashCode
// @AllArgsConstructor
// @NoArgsConstructor
// @Getter
// @Data

@Service
public class RideService {

    private static final Logger log = LoggerFactory.getLogger(RideService.class);
    // Status constants
    private static final String STATUS_SCHEDULED = "SCHEDULED";
    private static final String STATUS_CANCELLED_BY_DRIVER = "CANCELLED_BY_DRIVER";

        // Add other statuses like ACTIVE, COMPLETED later

    @Autowired
    private RideRepository rideRepository;
    
    @Autowired
    private UserRepository userRepository; // To get driver details

<<<<<<< HEAD
    @Autowired // Inject BookingRepository for cancellation logic
    private BookingRepository bookingRepository;

    @Autowired // Inject BookingService for helper methods (if needed, e.g., seat increment)
    private BookingService bookingService; // Or just re-implement increment here

    


=======
    @Autowired // Use field injection like your other fields
    private NotificationService notificationService;

    @Autowired
    private BookingService bookingService;
>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)

    /**
     * Creates a new ride offer based on the provided DTO and driver email.
     *
     * @param rideDTO     Data transfer object containing ride details.
     * @param driverEmail Email of the driver offering the ride.
     * @return The newly created and saved Ride entity.
     * @throws ResourceNotFoundException if the driver user is not found.
     */
    @Transactional // Ensures atomicity if more complex operations are added later
    public RideDTO createRide(RideCreationDTO rideDTO, String driverEmail) {
        // 1. Find the driver User object
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> {
                    log.error("Attempted to create ride for non-existent user: {}", driverEmail);
                    return new ResourceNotFoundException("User (driver) not found with email: " + driverEmail);
                });

        // Basic Validation (can add more)
        if (rideDTO.getTotalSeats() <= 0) {
             throw new IllegalArgumentException("Total seats must be positive.");
        }
        if (rideDTO.getFarePerSeat() < 0) {
             throw new IllegalArgumentException("Fare per seat cannot be negative.");
        }
         if (rideDTO.getDepartureTime() == null || rideDTO.getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Departure time must be set and be in the future.");
        }

        // 2. Create a new Ride entity
        Ride newRide = new Ride();
        newRide.setDriverId(driver.getId()); // Link to the driver

        // 3. Map data from DTO
        newRide.setDepartureCity(rideDTO.getDepartureCity());
        newRide.setDestinationCity(rideDTO.getDestinationCity());
        newRide.setDepartureAddress(rideDTO.getDepartureAddress());
        newRide.setDestinationAddress(rideDTO.getDestinationAddress());
        newRide.setDepartureTime(rideDTO.getDepartureTime());
        newRide.setTotalSeats(rideDTO.getTotalSeats());
        newRide.setAvailableSeats(rideDTO.getTotalSeats()); // Initially, all seats are available
        newRide.setFarePerSeat(rideDTO.getFarePerSeat());
        newRide.setIntermediateStops(rideDTO.getIntermediateStops() != null ? rideDTO.getIntermediateStops() : Collections.emptyList()); // Handle null stops
        newRide.setLuggagePreference(rideDTO.getLuggagePreference());
        newRide.setSmokingAllowed(rideDTO.isSmokingAllowed());
        newRide.setPetsAllowed(rideDTO.isPetsAllowed());
        newRide.setRideNotes(rideDTO.getRideNotes());

        // 4. Set initial status (Auditing will handle created/updated timestamps)
      
        newRide.setStatus(RideStatus.SCHEDULED); // Use Enum later

        // 5. Save the ride
        Ride savedRide = rideRepository.save(newRide);
        log.info("Ride created successfully with ID: {} by driver: {}", savedRide.getId(), driverEmail);
        return convertToDto(savedRide);
    }

    /**
     * Searches for rides based on criteria. Only returns rides that are scheduled
     * for the future and have available seats.
     *
     * @param departureCity     The departure city.
     * @param destinationCity   The destination city.
     * @param earliestDeparture The earliest departure time to search from (defaults to now).
     * @return A list of matching Ride entities.
     */
     public List<RideDTO> searchRides(String departureCity, String destinationCity, LocalDateTime earliestDeparture) {
         LocalDateTime searchTime = (earliestDeparture != null) ? earliestDeparture : LocalDateTime.now();
         log.info("Searching for rides from '{}' to '{}' departing after '{}' with available seats",
                  departureCity, destinationCity, searchTime);

         List<Ride> results = rideRepository.findByDepartureCityAndDestinationCityAndDepartureTimeAfterAndAvailableSeatsGreaterThan(
             departureCity,
             destinationCity,
             searchTime,
             0 // Find rides with at least 1 available seat
         );
         log.info("Found {} rides matching search criteria.", results.size());
         return convertToDtoList(results);
     }

<<<<<<< HEAD

        // --- NEW METHOD: Update Ride ---
    @Transactional
    public Ride updateRide(String rideId, RideUpdateDTO dto, String driverEmail) {
        log.info("Driver '{}' attempting to update ride ID: {}", driverEmail, rideId);

        User driver = findUserByEmail(driverEmail); // Use helper
        Ride ride = findRideById(rideId); // Use helper

        // 1. Validation
        validateRideOwnership(ride, driver);
        validateRideStatus(ride, STATUS_SCHEDULED, "update"); // Only allow updating scheduled rides

        // 2. Map *non-null* fields from DTO to Ride entity
        boolean updated = false;
        if (dto.getDepartureCity() != null) { ride.setDepartureCity(dto.getDepartureCity()); updated = true; }
        if (dto.getDestinationCity() != null) { ride.setDestinationCity(dto.getDestinationCity()); updated = true; }
        if (dto.getDepartureAddress() != null) { ride.setDepartureAddress(dto.getDepartureAddress()); updated = true; }
        if (dto.getDestinationAddress() != null) { ride.setDestinationAddress(dto.getDestinationAddress()); updated = true; }
        if (dto.getDepartureTime() != null) {
             if (dto.getDepartureTime().isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("Updated departure time must be in the future.");
            }
            ride.setDepartureTime(dto.getDepartureTime()); updated = true;
        }
        // Add more complex validation for seats if needed (e.g., can't reduce below booked)
        if (dto.getTotalSeats() != null) {
             if (dto.getTotalSeats() <= 0) throw new IllegalArgumentException("Total seats must be positive.");
             // Adjust available seats proportionally if total seats change (complex logic needed)
             // For now, let's just update total, maybe reset available? Simpler: just update total for now.
             // Be careful changing seats on rides with bookings! Revisit this logic.
            ride.setTotalSeats(dto.getTotalSeats()); updated = true;
            // Simple approach: If total seats decrease, cap available seats
             ride.setAvailableSeats(Math.min(ride.getAvailableSeats(), ride.getTotalSeats()));
         }
        if (dto.getFarePerSeat() != null) {
             if (dto.getFarePerSeat() < 0) throw new IllegalArgumentException("Fare cannot be negative.");
            ride.setFarePerSeat(dto.getFarePerSeat()); updated = true;
        }
        if (dto.getIntermediateStops() != null) { ride.setIntermediateStops(dto.getIntermediateStops()); updated = true; }
        if (dto.getLuggagePreference() != null) { ride.setLuggagePreference(dto.getLuggagePreference()); updated = true; }
        if (dto.getSmokingAllowed() != null) { ride.setSmokingAllowed(dto.getSmokingAllowed()); updated = true; }
        if (dto.getPetsAllowed() != null) { ride.setPetsAllowed(dto.getPetsAllowed()); updated = true; }
        if (dto.getRideNotes() != null) { ride.setRideNotes(dto.getRideNotes()); updated = true; }

        // 3. Save if changes were made
        if (updated) {
            // Let auditing handle updatedAt
            Ride savedRide = rideRepository.save(ride);
            log.info("Ride ID: {} updated successfully by driver '{}'", rideId, driverEmail);
            return savedRide;
        } else {
            log.info("No fields provided to update for ride ID: {}", rideId);
            return ride; // Return original ride if no changes
        }
    }


    // --- NEW METHOD: Cancel Ride ---
    @Transactional
    public void cancelRideByDriver(String rideId, String driverEmail) {
         log.info("Driver '{}' attempting to cancel ride ID: {}", driverEmail, rideId);

         User driver = findUserByEmail(driverEmail);
         Ride ride = findRideById(rideId);

         // 1. Validation
         validateRideOwnership(ride, driver);
         validateRideStatus(ride, STATUS_SCHEDULED, "cancel"); // Only allow cancelling scheduled rides

         // 2. Update Ride Status
         ride.setStatus(STATUS_CANCELLED_BY_DRIVER);
         // Let auditing handle updatedAt
         rideRepository.save(ride);
         log.info("Ride ID: {} status updated to CANCELLED_BY_DRIVER", rideId);

         // 3. Find and Cancel Associated Active Bookings
         List<Booking> associatedBookings = bookingRepository.findByRideId(rideId);
         int cancelledBookingsCount = 0;
         for (Booking booking : associatedBookings) {
             // Only cancel bookings that were requested or confirmed
             if (BookingService.ACTIVE_BOOKING_STATES.contains(booking.getStatus())) {
                 boolean wasConfirmed = BookingService.STATUS_CONFIRMED.equalsIgnoreCase(booking.getStatus());

                 booking.setStatus(BookingService.STATUS_CANCELLED_BY_DRIVER); // Use status from BookingService
                 booking.setCancellationTime(LocalDateTime.now());
                 bookingRepository.save(booking);
                 cancelledBookingsCount++;
                 log.info("Associated Booking ID: {} status updated to CANCELLED_BY_DRIVER", booking.getId());

                 // If booking was confirmed, refund the seat (logically)
                 // Note: Actual seat increment might not be needed on a cancelled ride,
                 // but cancelling the booking is crucial.
                 // if (wasConfirmed) {
                 //     bookingService.incrementAvailableSeats(rideId, booking.getRequestedSeats()); // Or implement helper here
                 // }

                 // Send notification to Passenger about ride cancellation
             }
         }
         log.info("Cancelled {} associated bookings for ride ID: {}", cancelledBookingsCount, rideId);
         // Return void or maybe a confirmation DTO/message
    }


    // --- Helper Methods ---
     private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

     private Ride findRideById(String rideId) {
         return rideRepository.findById(rideId)
                 .orElseThrow(() -> new ResourceNotFoundException("Ride not found with ID: " + rideId));
     }

    private void validateRideOwnership(Ride ride, User driver) {
        if (!Objects.equals(ride.getDriverId(), driver.getId())) {
             log.warn("Authorization failed: Driver '{}' (ID: {}) attempted to access ride ID: {} owned by driver ID: {}",
                     driver.getEmail(), driver.getId(), ride.getId(), ride.getDriverId());
            throw new AccessDeniedException("You are not authorized to manage this ride.");
        }
    }

     private void validateRideStatus(Ride ride, String expectedStatus, String action) {
        if (!expectedStatus.equalsIgnoreCase(ride.getStatus())) {
             log.warn("Action '{}' failed for ride ID: {}. Expected status '{}', but was '{}'",
                     action, ride.getId(), expectedStatus, ride.getStatus());
            throw new BookingException(String.format( // Using BookingException for status issues
                    "Cannot %s ride. Current status is '%s', expected '%s'.",
                    action, ride.getStatus(), expectedStatus
            ));
        }
    }

     // --- findRidesByDriverEmail method remains the same ---
     public List<Ride> findRidesByDriverEmail(String driverEmail) {
         User driver = findUserByEmail(driverEmail);
         log.info("Fetching rides offered by driver ID: {}", driver.getId());
         List<Ride> rides = rideRepository.findByDriverId(driver.getId());
         log.info("Found {} rides for driver ID: {}", rides.size(), driver.getId());
         return rides;
    }
}
 
=======
    // --- Placeholder for finding rides by driver (for /my-rides endpoint) ---
    public List<RideDTO> findRidesByDriverEmail(String driverEmail) {
         User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User (driver) not found with email: " + driverEmail));
         log.info("Fetching rides for driver ID: {}", driver.getId());
         List<Ride> rides = rideRepository.findByDriverId(driver.getId()); // Get the entities first
        return convertToDtoList(rides); // Then convert and return the DTO list
    }


 /**
 * Allows the driver of the ride to mark it as ACTIVE.
 *
 * @param rideId The ID of the ride to start.
 * @return The updated Ride object.
 * @throws ResourceNotFoundException if ride not found.
 * @throws UnauthorizedOperationException if the current user is not the driver.
 * @throws IllegalRideStateException if the ride is not in SCHEDULED status.
 */
@Transactional
public RideDTO startRide(String rideId) {
    String currentUserEmail = AuthenticationUtil.getCurrentUserEmail();
    User driver = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found with email: " + currentUserEmail)); // Should not happen if JWT is valid

    Ride ride = rideRepository.findById(rideId)
        .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + rideId));

    // Authorization Check: Is the current user the driver of this ride?
    if (!ride.getDriverId().equals(driver.getId())) {
        log.warn("User '{}' (ID: {}) attempted to start ride '{}' owned by driver ID '{}'", currentUserEmail, driver.getId(), rideId, ride.getDriverId());
        throw new UnauthorizedOperationException("Only the driver can start this ride.");
    }

    // State Check: Can only start a scheduled ride
    if (ride.getStatus() != RideStatus.SCHEDULED) {
        log.warn("Attempted to start ride '{}' which is already in status: {}", rideId, ride.getStatus());
        throw new IllegalRideStateException("Ride cannot be started. Current status: " + ride.getStatus());
    }

    // Optional: Add time-based checks if needed (e.g., cannot start too early)

    ride.setStatus(RideStatus.ACTIVE);
    Ride updatedRide = rideRepository.save(ride);
    log.info("Ride '{}' successfully started by driver '{}'", rideId, currentUserEmail);

   // return convertToDto(updatedRide);

     // **** ADD NOTIFICATION CALL BEFORE THE RETURN STATEMENT ****
     RideDTO updatedDto = convertToDto(updatedRide); // Convert first
     notificationService.notifyRideStatusUpdate(updatedDto); // Send notification
     return updatedDto; // Return the DTO
}

/**
 * Allows the driver of the ride to mark it as COMPLETED.
 *
 * @param rideId The ID of the ride to complete.
 * @return The updated Ride object.
 * @throws ResourceNotFoundException if ride not found.
 * @throws UnauthorizedOperationException if the current user is not the driver.
 * @throws IllegalRideStateException if the ride is not in ACTIVE status.
 */
@Transactional
public RideDTO completeRide(String rideId) {
    String currentUserEmail = AuthenticationUtil.getCurrentUserEmail();
    User driver = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found with email: " + currentUserEmail));

    Ride ride = rideRepository.findById(rideId)
        .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + rideId));

    // Authorization Check
    if (!ride.getDriverId().equals(driver.getId())) {
         log.warn("User '{}' (ID: {}) attempted to complete ride '{}' owned by driver ID '{}'", currentUserEmail, driver.getId(), rideId, ride.getDriverId());
        throw new UnauthorizedOperationException("Only the driver can complete this ride.");
    }

    // State Check: Can only complete an active ride
    if (ride.getStatus() != RideStatus.ACTIVE) {
        log.warn("Attempted to complete ride '{}' which is not active. Current status: {}", rideId, ride.getStatus());
        throw new IllegalRideStateException("Ride cannot be completed. Current status: " + ride.getStatus());
    }

    ride.setStatus(RideStatus.COMPLETED);
    Ride updatedRide = rideRepository.save(ride);
    log.info("Ride '{}' successfully completed by driver '{}'", rideId, currentUserEmail);

    

    // ****  NOTIFICATION CALL BEFORE THE RETURN STATEMENT ****
    RideDTO updatedDto = convertToDto(updatedRide); // Convert first
    notificationService.notifyRideStatusUpdate(updatedDto); // Send notification
    return updatedDto; 
}

/**
 * Allows the driver to cancel a ride they own.
 * (This updates the existing cancel logic if you had one, otherwise add it).
 *
 * @param rideId The ID of the ride to cancel.
 * @throws ResourceNotFoundException if ride not found.
 * @throws UnauthorizedOperationException if the current user is not the driver.
 * @throws IllegalRideStateException if the ride is already completed or cancelled.
 */
@Transactional
public void cancelRideByDriver(String rideId) { // Renamed for clarity
    String currentUserEmail = AuthenticationUtil.getCurrentUserEmail();
     User driver = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found with email: " + currentUserEmail));

    Ride ride = rideRepository.findById(rideId)
            .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + rideId));

    // Authorization Check
    if (!ride.getDriverId().equals(driver.getId())) {
         log.warn("User '{}' (ID: {}) attempted to cancel ride '{}' owned by driver ID '{}'", currentUserEmail, driver.getId(), rideId, ride.getDriverId());
        throw new UnauthorizedOperationException("Only the driver can cancel this ride.");
    }

    // State Check: Cannot cancel a completed ride. Allow cancelling SCHEDULED or ACTIVE rides.
    if (ride.getStatus() == RideStatus.COMPLETED) {
         log.warn("Attempted to cancel ride '{}' which is already completed.", rideId);
         throw new IllegalRideStateException("Cannot cancel a completed ride.");
    }
    if (ride.getStatus() == RideStatus.CANCELLED_BY_DRIVER) {
         log.info("Ride '{}' is already cancelled by driver. No action needed.", rideId);
         return; // Idempotent: Already in the desired state
    }

    ride.setStatus(RideStatus.CANCELLED_BY_DRIVER);
    rideRepository.save(ride);
    log.info("Ride '{}' successfully cancelled by driver '{}'", rideId, currentUserEmail);
    notificationService.notifyRideStatusUpdate(convertToDto(ride)); // Send status update
    bookingService.cancelBookingsForRide(ride.getId(), BookingStatus.CANCELLED_BY_DRIVER);


}




// Helper method to convert Ride entity to RideDTO
    private RideDTO convertToDto(Ride ride) {
        if (ride == null) {
            return null;
        }
        RideDTO dto = new RideDTO();
        dto.setId(ride.getId());
        dto.setDriverId(ride.getDriverId());
        dto.setDepartureCity(ride.getDepartureCity());
        dto.setDestinationCity(ride.getDestinationCity());
        dto.setDepartureAddress(ride.getDepartureAddress());
        dto.setDestinationAddress(ride.getDestinationAddress());
        dto.setDepartureTime(ride.getDepartureTime());
        dto.setEstimatedArrivalTime(ride.getEstimatedArrivalTime());
        dto.setAvailableSeats(ride.getAvailableSeats());
        dto.setTotalSeats(ride.getTotalSeats());
        dto.setFarePerSeat(ride.getFarePerSeat());
        dto.setIntermediateStops(ride.getIntermediateStops());
        dto.setLuggagePreference(ride.getLuggagePreference());
        dto.setSmokingAllowed(ride.isSmokingAllowed());
        dto.setPetsAllowed(ride.isPetsAllowed());
        dto.setRideNotes(ride.getRideNotes());
        dto.setStatus(ride.getStatus()); // Map the status enum
        dto.setCreatedAt(ride.getCreatedAt()); // Assumes Auditing is setup or handles null
        dto.setUpdatedAt(ride.getUpdatedAt()); // Assumes Auditing is setup or handles null
        return dto;
    }

    // Helper method to convert a list of Ride entities to a list of RideDTOs
    private List<RideDTO> convertToDtoList(List<Ride> rides) {
        if (rides == null || rides.isEmpty()) {
            return Collections.emptyList();
        }
        return rides.stream()
                    .map(this::convertToDto) // Reference the convertToDto method
                    .collect(Collectors.toList()); // Collect the results into a new list
    }

// **** START OF NEW METHOD TO ADD ****
@Transactional
public RideDTO updateRide(String rideId, RideUpdateDTO rideUpdateDTO) {
    String currentUserEmail = AuthenticationUtil.getCurrentUserEmail();
    User driver = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> {
                log.error("Authenticated user not found with email: {} during ride update attempt for rideId: {}", currentUserEmail, rideId);
                return new ResourceNotFoundException("Authenticated driver not found: " + currentUserEmail);
            });

    Ride ride = rideRepository.findById(rideId)
        .orElseThrow(() -> {
            log.warn("Attempt to update non-existent ride with ID: {}", rideId);
            return new ResourceNotFoundException("Ride not found with id: " + rideId);
        });

    // 1. Authorization Check
    if (!ride.getDriverId().equals(driver.getId())) {
        log.warn("User '{}' (ID: {}) attempted to update ride '{}' owned by driver ID '{}'",
                currentUserEmail, driver.getId(), rideId, ride.getDriverId());
        throw new UnauthorizedOperationException("You are not authorized to update this ride.");
    }

    // 2. State Check
    if (ride.getStatus() != RideStatus.SCHEDULED) {
        log.warn("Attempted to update ride '{}' which is not in SCHEDULED status. Current status: {}",
                rideId, ride.getStatus());
        throw new IllegalRideStateException("Ride can only be updated if it is in SCHEDULED status. Current status: " + ride.getStatus());
    }

    // 3. Basic Validation for critical fields
    if (rideUpdateDTO.getDepartureTime() != null && rideUpdateDTO.getDepartureTime().isBefore(LocalDateTime.now().minusMinutes(1))) {
         throw new IllegalArgumentException("New departure time must be in the future.");
    }
    if (rideUpdateDTO.getTotalSeats() != null && rideUpdateDTO.getTotalSeats() <= 0) {
        throw new IllegalArgumentException("Total seats must be positive.");
    }
    if (rideUpdateDTO.getAvailableSeats() != null && rideUpdateDTO.getTotalSeats() != null && rideUpdateDTO.getAvailableSeats() > rideUpdateDTO.getTotalSeats()) {
        throw new IllegalArgumentException("Available seats cannot exceed total seats specified in update.");
    }
     if (rideUpdateDTO.getAvailableSeats() != null && rideUpdateDTO.getAvailableSeats() < 0) {
        throw new IllegalArgumentException("Available seats cannot be negative.");
    }


    // 4. Map updatable fields from DTO to entity
    boolean significantChange = false;

    if (rideUpdateDTO.getDepartureCity() != null && !rideUpdateDTO.getDepartureCity().equals(ride.getDepartureCity())) {
        ride.setDepartureCity(rideUpdateDTO.getDepartureCity());
        significantChange = true;
    }
    if (rideUpdateDTO.getDestinationCity() != null && !rideUpdateDTO.getDestinationCity().equals(ride.getDestinationCity())) {
        ride.setDestinationCity(rideUpdateDTO.getDestinationCity());
        significantChange = true;
    }
    if (rideUpdateDTO.getDepartureAddress() != null) {
        ride.setDepartureAddress(rideUpdateDTO.getDepartureAddress());
        // Consider if address change is significant
    }
    if (rideUpdateDTO.getDestinationAddress() != null) {
        ride.setDestinationAddress(rideUpdateDTO.getDestinationAddress());
        // Consider if address change is significant
    }
    if (rideUpdateDTO.getDepartureTime() != null && !rideUpdateDTO.getDepartureTime().equals(ride.getDepartureTime())) {
        ride.setDepartureTime(rideUpdateDTO.getDepartureTime());
        significantChange = true;
    }

    if (rideUpdateDTO.getTotalSeats() != null) {
        int oldTotalSeats = ride.getTotalSeats();
        int newTotalSeats = rideUpdateDTO.getTotalSeats();
        int bookedSeats = oldTotalSeats - ride.getAvailableSeats();

        if (newTotalSeats < bookedSeats) {
            throw new IllegalRideStateException("Cannot reduce total seats ("+newTotalSeats+") below the number of already booked seats (" + bookedSeats + ").");
        }
        ride.setTotalSeats(newTotalSeats);
        if (rideUpdateDTO.getAvailableSeats() == null) { // If available seats not explicitly set in DTO
             ride.setAvailableSeats(newTotalSeats - bookedSeats);
        }
        significantChange = true;
    }

    if (rideUpdateDTO.getAvailableSeats() != null) {
        int currentTotalSeats = ride.getTotalSeats(); // Use the (potentially just updated) total seats
        if (rideUpdateDTO.getAvailableSeats() > currentTotalSeats) {
             throw new IllegalArgumentException("Available seats ("+rideUpdateDTO.getAvailableSeats()+") cannot exceed total seats (" + currentTotalSeats + ").");
        }
         if (rideUpdateDTO.getAvailableSeats() < (currentTotalSeats - ride.getTotalSeats() + ride.getAvailableSeats()) && ride.getTotalSeats() - ride.getAvailableSeats() > 0 ) { // Ensure available seats isn't less than what's needed for current bookings
            int bookedSeats = ride.getTotalSeats() - ride.getAvailableSeats();
            if (rideUpdateDTO.getAvailableSeats() < bookedSeats) {
                 throw new IllegalArgumentException("Cannot set available seats ("+rideUpdateDTO.getAvailableSeats()+") less than already booked seats (" + bookedSeats + ").");
            }
        }
        ride.setAvailableSeats(rideUpdateDTO.getAvailableSeats());
        significantChange = true;
    }


    if (rideUpdateDTO.getFarePerSeat() != null && rideUpdateDTO.getFarePerSeat().doubleValue() != ride.getFarePerSeat()) {
        ride.setFarePerSeat(rideUpdateDTO.getFarePerSeat());
        significantChange = true;
    }
    if (rideUpdateDTO.getIntermediateStops() != null) {
        ride.setIntermediateStops(rideUpdateDTO.getIntermediateStops());
    }
    if (rideUpdateDTO.getLuggagePreference() != null) {
        ride.setLuggagePreference(rideUpdateDTO.getLuggagePreference());
    }
    if (rideUpdateDTO.getSmokingAllowed() != null) {
        ride.setSmokingAllowed(rideUpdateDTO.getSmokingAllowed());
    }
    if (rideUpdateDTO.getPetsAllowed() != null) {
        ride.setPetsAllowed(rideUpdateDTO.getPetsAllowed());
    }
    if (rideUpdateDTO.getRideNotes() != null) {
        ride.setRideNotes(rideUpdateDTO.getRideNotes());
    }

    Ride updatedRideEntity = rideRepository.save(ride); // Save the entity
    log.info("Ride '{}' updated in repository by driver '{}'. Significant change: {}", rideId, currentUserEmail, significantChange);

    RideDTO updatedRideDTO = convertToDto(updatedRideEntity); // Convert to DTO for return and notification

    if (significantChange) {
        bookingService.notifyPassengersOfRideUpdate(rideId, "Details for your booked ride ID " + rideId + " have been updated by the driver. Please review the changes.");
    }

    return updatedRideDTO;
}
// **** END OF NEW METHOD TO ADD ****
>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)

