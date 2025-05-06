package com.carsharing.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed; // Import for index
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data // Lombok: Generates getters, setters, toString, equals, hashCode
@NoArgsConstructor // Lombok: Generates no-args constructor
@AllArgsConstructor // Lombok: Generates all-args constructor
@Document(collection = "chat_messages") // Maps this class to the "chat_messages" collection
public class ChatMessage {

    @Id
    private String id; // MongoDB unique ID

    @Indexed // Index for faster querying by ride
    @Field("ride_id")
    private String rideId;

    @Field("sender_id") // User ID of the person who sent the message
    private String senderId;

    @Field("sender_role") // "DRIVER" or "PASSENGER"
    private String senderRole;

    @Field("content") // The text content of the message
    private String content;

    // Use @CreatedDate if MongoDB Auditing is enabled, otherwise set manually
    // @CreatedDate
    @Indexed // Index for sorting by time
    @Field("timestamp")
    private LocalDateTime timestamp; // When the message was sent/saved

}