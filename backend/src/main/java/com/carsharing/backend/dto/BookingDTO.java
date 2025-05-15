// package com.carsharing.backend.dto;

// import com.carsharing.backend.model.BookingStatus;
// import lombok.Data;
// import java.time.LocalDateTime;

// @Data
// public class BookingDTO {
//     private String id;
//     private String rideId;
//     private String passengerId; // Consider passenger details if needed
//     private String driverId;    // Consider driver details if needed
//     private int requestedSeats;
//     private BookingStatus status;
//     private LocalDateTime bookingTime; // Or createdAt from Booking model
//     private LocalDateTime confirmationTime;
//     private LocalDateTime cancellationTime;
//     // Add any other fields you want to expose from Booking
// }



package com.carsharing.backend.dto;

import com.carsharing.backend.model.BookingStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingDTO {
    private String id;
    private String rideId;
    private String passengerId; // Consider passenger details if needed
    private String driverId;    // Consider driver details if needed
    private int requestedSeats;
    private BookingStatus status;
    private LocalDateTime bookingTime; // Or createdAt from Booking model
    private LocalDateTime confirmationTime;
    private LocalDateTime cancellationTime;

    // --- ADDED FIELDS ---
    private String departureCity;
    private String destinationCity;
    private String departureState;
    private String destinationState;
    private String driverName; // Assuming your User model has a 'name' field
    // Add any other fields you want to expose from Booking
}