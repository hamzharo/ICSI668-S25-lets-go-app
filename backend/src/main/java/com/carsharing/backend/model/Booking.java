package com.carsharing.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import com.carsharing.backend.model.BookingStatus;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings") // Maps this class to the "bookings" collection
public class Booking {

    @Id
    private String id;

    @Field("ride_id") // Links to the Ride document ID
    private String rideId;

    @Field("passenger_id") // Links to the User ID of the passenger
    private String passengerId;

    @Field("driver_id") // Store driver ID for easier querying/notifications
    private String driverId;

    @Field("requested_seats") // Number of seats booked by the passenger
    private int requestedSeats;

    /**
     * Status of the booking. Potential values:
     * - REQUESTED: Passenger has requested, pending driver action.
     * - CONFIRMED: Driver accepted the request.
     * - REJECTED_BY_DRIVER: Driver denied the request.
     * - CANCELLED_BY_PASSENGER: Passenger cancelled after confirmation.
     * - CANCELLED_BY_DRIVER: Driver cancelled the ride after confirmation.
     * - COMPLETED: The ride associated with this booking was completed.
     * (Could be an Enum later)
     */
    @Field("status")
    private BookingStatus status;
    @Field("payment_id") // Links to a Payment document ID (can be null initially)
    private String paymentId;

    // --- Timestamps ---

    @CreatedDate // When the booking was first requested
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate // When the booking status last changed
    @Field("updated_at")
    private LocalDateTime updatedAt;

    @Field("confirmation_time") // Timestamp when status changed to CONFIRMED (optional)
    private LocalDateTime confirmationTime;

    @Field("cancellation_time") // Timestamp when status changed to CANCELLED_* (optional)
    private LocalDateTime cancellationTime;


    // If not using Lombok, add constructors, getters, and setters manually below.
}