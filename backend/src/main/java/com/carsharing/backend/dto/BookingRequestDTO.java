package com.carsharing.backend.dto;

public class BookingRequestDTO {
    // Add validation later (@Min(1))
    private int requestedSeats;

    // Getter and Setter (or use Lombok @Data)
    public int getRequestedSeats() {
        return requestedSeats;
    }

    public void setRequestedSeats(int requestedSeats) {
        this.requestedSeats = requestedSeats;
    }
}