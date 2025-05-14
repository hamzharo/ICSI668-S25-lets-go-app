package com.carsharing.backend.dto;

import jakarta.validation.constraints.*; // For validation
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

@Data
public class RideUpdateDTO {

    @Size(min = 2, max = 100, message = "Departure city must be between 2 and 100 characters")
    private String departureCity;

    @Size(min = 2, max = 100, message = "Destination city must be between 2 and 100 characters")
    private String destinationCity;


    @Size(min = 2, max = 100, message = "Departure state  must be between 2 and 100 characters")
    private String departureState;

    @Size(min = 2, max = 100, message = "Destination state must be between 2 and 100 characters")
    private String destinationStae ;

    @Size(max = 255, message = "Departure address can be up to 255 characters")
    private String departureAddress;

    @Size(max = 255, message = "Destination address can be up to 255 characters")
    private String destinationAddress;

    @Future(message = "Departure time must be in the future")
    private LocalDateTime departureTime;

    @Min(value = 0, message = "Available seats cannot be negative")
    private Integer availableSeats;

    @Min(value = 1, message = "Total seats must be at least 1")
    private Integer totalSeats;

    @PositiveOrZero(message = "Fare per seat must be a positive value or zero")
    private Double farePerSeat;

    private List<String> intermediateStops;

    @Size(max = 100, message = "Luggage preference can be up to 100 characters")
    private String luggagePreference;

    private Boolean smokingAllowed;

    private Boolean petsAllowed;

    @Size(max = 500, message = "Ride notes can be up to 500 characters")
    private String rideNotes;
    
    private LocalDateTime estimatedArrivalTime;
}