package com.carsharing.backend.model;

/**
 * Represents the possible states of a Booking.
 */
public enum BookingStatus {
    REQUESTED,          // Passenger has requested, awaiting driver confirmation.
    CONFIRMED,          // Driver has confirmed the booking.
    REJECTED_BY_DRIVER, // Driver has rejected the booking request.
    CANCELLED_BY_PASSENGER, // Passenger cancelled their confirmed or requested booking.
    CANCELLED_BY_DRIVER,  // Booking cancelled because the driver cancelled the entire ride.
    COMPLETED           // Booking considered completed (after ride completion). Add if needed later.
}