package com.carsharing.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

// Add validation annotations later (e.g., @NotNull, @Future, @Min)
public class RideCreationDTO {

    private String departureCity;
    private String destinationState;
    private String departureState;
    private String destinationCity;
    private String departureAddress; // Optional
    private String destinationAddress; // Optional
    private LocalDateTime departureTime;
    private int totalSeats; // Driver specifies total seats offered
    private double farePerSeat;
    private List<String> intermediateStops; // Optional
    private String luggagePreference; // e.g., "SMALL"
    private boolean smokingAllowed;
    private boolean petsAllowed;
    private String rideNotes; // Optional
    private LocalDateTime estimatedArrivalTime;

    // --- Getters and Setters (or use Lombok @Data) ---

    public String getDepartureCity() { return departureCity; }
    public void setDepartureCity(String departureCity) { this.departureCity = departureCity; }

    public String getDestinationCity() { return destinationCity; }
    public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; }

    public String getDepartureState() { return departureState; }
    public void setDepartureState(String departureState) { this.departureState = departureState; }

    public String getDestinationState() { return destinationState; }
    public void setDestinationState(String destinationState) { this.destinationState = destinationState; }

    public String getDepartureAddress() { return departureAddress; }
    public void setDepartureAddress(String departureAddress) { this.departureAddress = departureAddress; }

    public String getDestinationAddress() { return destinationAddress; }
    public void setDestinationAddress(String destinationAddress) { this.destinationAddress = destinationAddress; }

    public LocalDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }

    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int totalSeats) { this.totalSeats = totalSeats; }

    public double getFarePerSeat() { return farePerSeat; }
    public void setFarePerSeat(double farePerSeat) { this.farePerSeat = farePerSeat; }

    public List<String> getIntermediateStops() { return intermediateStops; }
    public void setIntermediateStops(List<String> intermediateStops) { this.intermediateStops = intermediateStops; }

    public String getLuggagePreference() { return luggagePreference; }
    public void setLuggagePreference(String luggagePreference) { this.luggagePreference = luggagePreference; }

    public boolean isSmokingAllowed() { return smokingAllowed; }
    public void setSmokingAllowed(boolean smokingAllowed) { this.smokingAllowed = smokingAllowed; }

    public boolean isPetsAllowed() { return petsAllowed; }
    public void setPetsAllowed(boolean petsAllowed) { this.petsAllowed = petsAllowed; }

    public String getRideNotes() { return rideNotes; }
    public void setRideNotes(String rideNotes) { this.rideNotes = rideNotes; }

    public LocalDateTime getEstimatedArrivalTime() { return estimatedArrivalTime; }
    public void setEstimatedArrivalTime(LocalDateTime estimatedArrivalTime) { this.estimatedArrivalTime = estimatedArrivalTime; }
}