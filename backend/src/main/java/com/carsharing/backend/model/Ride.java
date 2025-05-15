package com.carsharing.backend.model;

import lombok.AllArgsConstructor; // Optional: if using Lombok
import lombok.Data;             // Optional: if using Lombok
import lombok.NoArgsConstructor;  // Optional: if using Lombok
import org.springframework.data.annotation.CreatedDate; // For Auditing (Optional setup needed)
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate; // For Auditing (Optional setup needed)
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field; // Good practice for clarity
import java.time.LocalDateTime;
import java.util.List;

@Data // Optional: Lombok annotation for getters, setters, toString, equals, hashCode
@NoArgsConstructor // Optional: Lombok annotation for no-args constructor
@AllArgsConstructor // Optional: Lombok annotation for all-args constructor
@Document(collection = "rides") // Maps this class to the "rides" collection in MongoDB
public class Ride {

    @Id
    private String id; // MongoDB automatically generates this if null

    @Field("driver_id") // Links to the User ID of the driver
    private String driverId;

    @Field("departure_city")
    private String departureCity;

    @Field("destination_city")
    private String destinationCity;

    @Field("departure_state")
    private String departureState;

    @Field("destination_state")
    private String destinationState;

    @Field("departure_address") // More specific departure point (optional)
    private String departureAddress;

    @Field("destination_address") // More specific destination point (optional)
    private String destinationAddress;

    @Field("departure_time") // Scheduled departure time
    private LocalDateTime departureTime;

    @Field("estimated_arrival_time") // Driver's estimate (optional)
    private LocalDateTime estimatedArrivalTime;

    @Field("available_seats") // Number of seats currently available for booking
    private int availableSeats;

    @Field("total_seats") // Original number of seats offered by the driver
    private int totalSeats;

    @Field("fare_per_seat") // Cost for one seat
    private double farePerSeat; // Use BigDecimal for financial precision if needed

    @Field("intermediate_stops") // List of stop names (optional)
    private List<String> intermediateStops;

    // --- Preferences & Details ---

    @Field("allow_luggage") // e.g., "NONE", "SMALL", "MEDIUM", "LARGE" (Could be Enum later)
    private String luggagePreference;

    @Field("allow_smoking")
    private boolean smokingAllowed;

    @Field("allow_pets")
    private boolean petsAllowed;

    @Field("ride_notes") // Any additional notes from the driver (optional)
    private String rideNotes;

    // --- Status & Timestamps ---

    @Field("status") // e.g., "SCHEDULED", "ACTIVE", "COMPLETED", "CANCELLED_BY_DRIVER" (Could be Enum later)
    private RideStatus status;

    @CreatedDate // Automatically set on creation (Requires @EnableMongoAuditing)
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate // Automatically set on update (Requires @EnableMongoAuditing)
    @Field("updated_at")
    private LocalDateTime updatedAt;

}