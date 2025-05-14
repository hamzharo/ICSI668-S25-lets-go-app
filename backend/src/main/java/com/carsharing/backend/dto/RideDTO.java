
package com.carsharing.backend.dto;

import com.carsharing.backend.model.RideStatus;
import lombok.Data; // <-- Make sure this import exists

import java.time.LocalDateTime;
import java.util.List;

@Data 
public class RideDTO {
    private String id;
    private String driverId;
    private String departureCity;
    private String destinationCity;
    private String departureState;
    private String destinationState;
    private String departureAddress;
    private String destinationAddress;
    private LocalDateTime departureTime;
    private LocalDateTime estimatedArrivalTime;
    private int availableSeats;
    private int totalSeats;
    private double farePerSeat;
    private List<String> intermediateStops;
    private String luggagePreference;
    private boolean smokingAllowed; 
    private boolean petsAllowed;    
    private String rideNotes;
    private RideStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    
}