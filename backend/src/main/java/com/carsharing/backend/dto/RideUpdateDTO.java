package com.carsharing.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

// Fields are optional - client sends only what they want to update
// Add validation later if needed (e.g., @Future for time, @Min for seats)
public class RideUpdateDTO {

    private String departureCity;
    private String destinationCity;
    private String departureAddress;
    private String destinationAddress;
    private LocalDateTime departureTime;
    private Integer totalSeats; // Use Integer to allow null check
    private Double farePerSeat; // Use Double to allow null check
    private List<String> intermediateStops;
    private String luggagePreference;
    private Boolean smokingAllowed; // Use Boolean to allow null check
    private Boolean petsAllowed;    // Use Boolean to allow null check
    private String rideNotes;

    // --- Getters and Setters (or use Lombok @Data/@Getter/@Setter) ---
    // Make sure all getters and setters are present

    public String getDepartureCity() { return departureCity; }
    public void setDepartureCity(String departureCity) { this.departureCity = departureCity; }
    // ... other getters/setters for all fields ...

    public String getDestinationCity() { return destinationCity; }
    public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; }

    public String getDepartureAddress() { return departureAddress; }
    public void setDepartureAddress(String departureAddress) { this.departureAddress = departureAddress; }

    public String getDestinationAddress() { return destinationAddress; }
    public void setDestinationAddress(String destinationAddress) { this.destinationAddress = destinationAddress; }

    public LocalDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }

    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }

    public Double getFarePerSeat() { return farePerSeat; }
    public void setFarePerSeat(Double farePerSeat) { this.farePerSeat = farePerSeat; }

    public List<String> getIntermediateStops() { return intermediateStops; }
    public void setIntermediateStops(List<String> intermediateStops) { this.intermediateStops = intermediateStops; }

    public String getLuggagePreference() { return luggagePreference; }
    public void setLuggagePreference(String luggagePreference) { this.luggagePreference = luggagePreference; }

    public Boolean getSmokingAllowed() { return smokingAllowed; }
    public void setSmokingAllowed(Boolean smokingAllowed) { this.smokingAllowed = smokingAllowed; }

    public Boolean getPetsAllowed() { return petsAllowed; }
    public void setPetsAllowed(Boolean petsAllowed) { this.petsAllowed = petsAllowed; }

    public String getRideNotes() { return rideNotes; }
    public void setRideNotes(String rideNotes) { this.rideNotes = rideNotes; }
}