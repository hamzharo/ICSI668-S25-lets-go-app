// package com.carsharing.backend.dto;

// import java.time.LocalDateTime;
// import java.util.List;

// // Fields are optional - client sends only what they want to update
// // Add validation later if needed (e.g., @Future for time, @Min for seats)
// public class RideUpdateDTO {

//     private String departureCity;
//     private String destinationCity;
//     private String departureAddress;
//     private String destinationAddress;
//     private LocalDateTime departureTime;
//     private Integer totalSeats; // Use Integer to allow null check
//     private Double farePerSeat; // Use Double to allow null check
//     private List<String> intermediateStops;
//     private String luggagePreference;
//     private Boolean smokingAllowed; // Use Boolean to allow null check
//     private Boolean petsAllowed;    // Use Boolean to allow null check
//     private String rideNotes;

//     // --- Getters and Setters (or use Lombok @Data/@Getter/@Setter) ---
//     // Make sure all getters and setters are present

//     public String getDepartureCity() { return departureCity; }
//     public void setDepartureCity(String departureCity) { this.departureCity = departureCity; }
//     // ... other getters/setters for all fields ...

//     public String getDestinationCity() { return destinationCity; }
//     public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; }

//     public String getDepartureAddress() { return departureAddress; }
//     public void setDepartureAddress(String departureAddress) { this.departureAddress = departureAddress; }

//     public String getDestinationAddress() { return destinationAddress; }
//     public void setDestinationAddress(String destinationAddress) { this.destinationAddress = destinationAddress; }

//     public LocalDateTime getDepartureTime() { return departureTime; }
//     public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }

//     public Integer getTotalSeats() { return totalSeats; }
//     public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }

//     public Double getFarePerSeat() { return farePerSeat; }
//     public void setFarePerSeat(Double farePerSeat) { this.farePerSeat = farePerSeat; }

//     public List<String> getIntermediateStops() { return intermediateStops; }
//     public void setIntermediateStops(List<String> intermediateStops) { this.intermediateStops = intermediateStops; }

//     public String getLuggagePreference() { return luggagePreference; }
//     public void setLuggagePreference(String luggagePreference) { this.luggagePreference = luggagePreference; }

//     public Boolean getSmokingAllowed() { return smokingAllowed; }
//     public void setSmokingAllowed(Boolean smokingAllowed) { this.smokingAllowed = smokingAllowed; }

//     public Boolean getPetsAllowed() { return petsAllowed; }
//     public void setPetsAllowed(Boolean petsAllowed) { this.petsAllowed = petsAllowed; }

//     public String getRideNotes() { return rideNotes; }
//     public void setRideNotes(String rideNotes) { this.rideNotes = rideNotes; }
// }

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