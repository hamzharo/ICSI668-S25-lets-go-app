package com.carsharing.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data // Lombok: Generates getters, setters, toString, equals, hashCode
@NoArgsConstructor // Lombok: Generates no-args constructor
@AllArgsConstructor // Lombok: Generates all-args constructor
public class ChatMessageDTO {

    // Fields typically sent FROM frontend (might only send content)
    private String content;

    // Fields sent TO frontend (include more details)
    private String rideId;
    private String senderId;
    private String senderName; // Add sender's display name
    private String senderRole; // "DRIVER" or "PASSENGER"
    private LocalDateTime timestamp;

    // You might have separate DTOs for incoming vs outgoing messages,
    // but this combined one works for now.
}