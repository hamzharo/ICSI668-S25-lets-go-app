package com.carsharing.backend.model;

/**
 * Represents the possible states of a Ride.
 */
public enum RideStatus {
    SCHEDULED,          // Ride created, awaiting departure time or driver start action.
    ACTIVE,             // Ride is currently in progress (driver has started it).
    COMPLETED,          // Ride finished successfully.
    CANCELLED_BY_DRIVER // Ride cancelled by the driver.
    // You could add more later if needed, e.g., CANCELLED_BY_PASSENGER (if a passenger cancellation triggers ride cancellation),
    // CANCELLED_SYSTEM (e.g., due to no bookings), etc.
}