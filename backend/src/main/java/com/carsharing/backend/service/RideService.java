package com.carsharing.backend.service;

import java.time.LocalDateTime;
import java.util.Collections; 
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.carsharing.backend.dto.RideCreationDTO;
import com.carsharing.backend.exception.ResourceNotFoundException;
import com.carsharing.backend.model.Ride;
import com.carsharing.backend.model.User;
import com.carsharing.backend.repository.RideRepository;
import com.carsharing.backend.repository.UserRepository;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@ToString
@Data
@Setter
@EqualsAndHashCode
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Service
public class RideService {

    private static final Logger log = LoggerFactory.getLogger(RideService.class);

    @Autowired
    private RideRepository rideRepository;

    
    @Autowired
    private UserRepository userRepository; // To get driver details

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

    // --- Placeholder for finding rides by driver (for /my-rides endpoint) ---
    public List<Ride> findRidesByDriverEmail(String driverEmail) {
         User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User (driver) not found with email: " + driverEmail));
         log.info("Fetching rides for driver ID: {}", driver.getId());
          // Use the existing repository method that finds by driverId
          List<Ride> rides = rideRepository.findByDriverId(driver.getId());
          log.info("Found {} rides for driver ID: {}", rides.size(), driver.getId());
          return rides;
    }


    // --- Other Ride methods (getById, update, delete) will go here later ---
 

}