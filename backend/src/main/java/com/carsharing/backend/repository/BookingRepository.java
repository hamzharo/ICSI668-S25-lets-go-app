package com.carsharing.backend.repository;

import com.carsharing.backend.model.Booking;
import com.carsharing.backend.model.BookingStatus; // Keep this import
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set; // Using Set for 'In' queries is common and efficient

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    // Find bookings made by a specific passenger
    List<Booking> findByPassengerId(String passengerId);

    // Find bookings related to a specific ride
    List<Booking> findByRideId(String rideId);

    // Find bookings for a specific driver (useful for notifications/management)
    List<Booking> findByDriverId(String driverId);

    // Find bookings for a specific ride with a specific status (using Enum)
    List<Booking> findByRideIdAndStatus(String rideId, BookingStatus status);

    // Find bookings for a specific driver with a specific status (using Enum)
    List<Booking> findByDriverIdAndStatus(String driverId, BookingStatus status);

    // Find bookings for a specific ride matching any of the given statuses (using Enum)
    List<Booking> findByRideIdAndStatusIn(String rideId, Set<BookingStatus> statuses); // Changed Collection to Set

    // Check if a passenger has an active booking for a specific ride (using Enum)
    // Renamed from existsByRideIdAndPassengerIdAndStatus to reflect checking multiple statuses
    boolean existsByRideIdAndPassengerIdAndStatusIn(String rideId, String passengerId, Set<BookingStatus> statuses); // Changed to Set for statuses

    // You might also need methods like:
    // List<Booking> findByDriverIdAndStatusIn(String driverId, Set<BookingStatus> statuses);
    // if you want to fetch, for example, all REQUESTED bookings for a driver.
}