package com.carsharing.backend.repository;

import com.carsharing.backend.model.Ride;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository // Good practice to annotate, though not strictly required for interfaces
public interface RideRepository extends MongoRepository<Ride, String> {

    // Find rides offered by a specific driver
    List<Ride> findByDriverId(String driverId);

    // Example search query (we'll refine this later in Step 3)
    // Find rides matching criteria and are still in the future with available seats
    List<Ride> findByDepartureCityAndDestinationCityAndDepartureTimeAfterAndAvailableSeatsGreaterThan(
            String departureCity,
            String destinationCity,
            LocalDateTime departureTime,
            int availableSeats
    );

    // You can add more specific query methods here as needed
}