package com.carsharing.backend.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects; 


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import com.carsharing.backend.dto.RideCreationDTO;
import com.carsharing.backend.dto.RideUpdateDTO; 
import com.carsharing.backend.exception.BookingException;
import com.carsharing.backend.exception.ResourceNotFoundException;
import com.carsharing.backend.model.Booking; 
import com.carsharing.backend.model.Ride;
import com.carsharing.backend.model.User;
import com.carsharing.backend.repository.BookingRepository;
import com.carsharing.backend.repository.RideRepository;
import com.carsharing.backend.repository.UserRepository;


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

    @Autowired // Inject BookingRepository for cancellation logic
    private BookingRepository bookingRepository;

    @Autowired // Inject BookingService for helper methods (if needed, e.g., seat increment)
    private BookingService bookingService; // Or just re-implement increment here

    



    /**
     * Creates a new ride offer based on the provided DTO and driver email.
     *
     * @param rideDTO     Data transfer object containing ride details.
     * @param driverEmail Email of the driver offering the ride.
     * @return The newly created and saved Ride entity.
     * @throws ResourceNotFoundException if the driver user is not found.
     */
    @Transactional // Ensures atomicity if more complex operations are added later
    public Ride createRide(RideCreationDTO rideDTO, String driverEmail) {
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
        newRide.setStatus("SCHEDULED"); // Use Enum later

        // 5. Save the ride
        Ride savedRide = rideRepository.save(newRide);
        log.info("Ride created successfully with ID: {} by driver: {}", savedRide.getId(), driverEmail);
        return savedRide;
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
     public List<Ride> searchRides(String departureCity, String destinationCity, LocalDateTime earliestDeparture) {
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
         return results;
     }


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
 

