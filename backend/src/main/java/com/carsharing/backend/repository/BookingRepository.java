package com.carsharing.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.carsharing.backend.model.Booking;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    // Find bookings made by a specific passenger
    List<Booking> findByPassengerId(String passengerId);

    // Find bookings related to a specific ride
    List<Booking> findByRideId(String rideId);

    // Find bookings for a specific driver (useful for notifications/management)
    List<Booking> findByDriverId(String driverId);

    // Find pending bookings for a specific ride (where driver needs to confirm)
    List<Booking> findByRideIdAndStatus(String rideId, String status);

    // Find pending bookings for a specific driver
    List<Booking> findByDriverIdAndStatus(String driverId, String status);

    // Add more queries as needed
}