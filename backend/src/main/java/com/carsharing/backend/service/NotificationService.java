package com.carsharing.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate; // Core class for sending WebSocket messages
import org.springframework.stereotype.Service;

import com.carsharing.backend.dto.RideDTO; 
import com.carsharing.backend.model.BookingStatus;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired // Inject the template provided by Spring
    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Sends a notification about a ride status update to a public topic
     * associated with that specific ride.
     * Frontend clients viewing this ride can subscribe to "/topic/ride/{rideId}/status".
     *
     * @param rideDto The RideDTO containing the updated ride information.
     */
    public void notifyRideStatusUpdate(RideDTO rideDto) {
        if (rideDto == null || rideDto.getId() == null) {
            log.warn("Attempted to send ride status update with null ride DTO or ID.");
            return;
        }
        String destination = "/topic/ride/" + rideDto.getId() + "/status";
        log.info("Sending ride status update to {}: {}", destination, rideDto);
        // Convert and send the RideDTO object as the message payload
        messagingTemplate.convertAndSend(destination, rideDto);
    }

    /**
     * Sends a notification to a specific user's private queue regarding their bookings.
     * Frontend clients should subscribe to "/user/queue/bookings" after authenticating.
     * NOTE: This requires proper Spring Security WebSocket integration for user mapping.
     *
     * @param userId  The ID of the user to notify.
     * @param payload The message payload (e.g., a BookingDTO, a status message String, etc.).
     */
    public void notifyUserBookingUpdate(String userId, Object payload) {
        if (userId == null || payload == null) {
            log.warn("Attempted to send booking update with null userId or payload.");
            return;
        }
        // Spring prepends the user destination prefix automatically.
        // The destination becomes effectively "/user/{userId}/queue/bookings"
        String destination = "/queue/bookings"; // User-specific part is handled by Spring
        log.info("Sending booking update notification to user {} at {}: {}", userId, destination, payload);
        messagingTemplate.convertAndSendToUser(userId, destination, payload);
    }

     // **** START OF NEW METHOD TO ADD ****
    /**
     * Sends a general booking-related update notification to a specific user.
     * This can be used for ride updates affecting a booking, cancellations, etc.
     *
     * @param passengerUserId The ID or principal name of the passenger user.
     * @param bookingId The ID of the booking affected.
     * @param bookingStatus The current status of the booking (can be informational).
     * @param message The custom message for the notification.
     */
    public void sendBookingUpdateNotification(String passengerUserId, String bookingId, BookingStatus bookingStatus, String message) {
        // The principal used here MUST match what Spring Security sets for STOMP user destinations.
        // If you set the email as the principal in JwtFilter, then passengerUserId should be the email.
        // If it's the user's database ID, and your WebSocketSecurityConfig maps it correctly, that's fine too.
        String userSpecificDestination = "/queue/bookings"; // The queue part
        log.info("Sending booking update to user '{}' for booking '{}' via {}: {}",
                passengerUserId, bookingId, userSpecificDestination, message);

        // Construct a payload object for better structure if needed
        // For now, sending the message directly.
        // Example payload: Map.of("bookingId", bookingId, "status", bookingStatus.name(), "message", message)
        messagingTemplate.convertAndSendToUser(
                passengerUserId,          // This is the user principal (e.g., email or username)
                userSpecificDestination,  // The user-specific queue
                message                   // The payload
        );
        // Note: SimpMessagingTemplate.convertAndSendToUser automatically prepends "/user/" to the principal name.
        // So, if passengerUserId is "user@example.com", the actual STOMP destination will be "/user/user@example.com/queue/bookings".
    }
    // **** END OF NEW METHOD TO ADD ****

}