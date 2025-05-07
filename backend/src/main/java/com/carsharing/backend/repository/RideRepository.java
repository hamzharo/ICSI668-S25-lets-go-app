package com.carsharing.backend.repository;

import com.carsharing.backend.model.Ride;
import com.carsharing.backend.model.RideStatus; // <-- ADD THIS IMPORT
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RideRepository extends MongoRepository<Ride, String> {

    // Find rides offered by a specific driver
    List<Ride> findByDriverId(String driverId);

    // Updated search query to include RideStatus
    List<Ride> findByDepartureCityAndDestinationCityAndStatusAndDepartureTimeAfterAndAvailableSeatsGreaterThan(
            String departureCity,
            String destinationCity,
            RideStatus status, // <-- ADDED RideStatus parameter
            LocalDateTime departureTime,
            int availableSeats
    );

    // You can add more specific query methods here as needed
    // For example, if you need to find rides by status for an admin:
    // List<Ride> findByStatus(RideStatus status);
}