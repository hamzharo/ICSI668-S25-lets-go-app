package com.carsharing.backend.service;

import com.carsharing.backend.dto.RideDTO;
import com.carsharing.backend.model.BookingStatus; // Make sure this is the enum
import com.carsharing.backend.model.DocumentStatus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map; // For creating a structured payload

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Sends a notification about a ride status update to a public topic.
     */
    public void notifyRideStatusUpdate(RideDTO rideDto) {
        if (rideDto == null || rideDto.getId() == null) {
            log.warn("Attempted to send ride status update with null ride DTO or ID.");
            return;
        }
        String destination = "/topic/ride/" + rideDto.getId() + "/status";
        log.info("Sending ride status update to {}: Ride ID {}, Status {}", destination, rideDto.getId(), rideDto.getStatus());
        messagingTemplate.convertAndSend(destination, rideDto); // Send the RideDTO
    }

    /**
     * Sends a general booking-related update notification to a specific user's private queue.
     * Used for confirmations, rejections, cancellations.
     *
     * @param userPrincipal The principal name of the user (e.g., email from JWT).
     * @param bookingId The ID of the booking.
     * @param status The new status of the booking.
     * @param message A descriptive message for the notification.
     */
    public void sendBookingUpdateNotification(String userPrincipal, String bookingId, BookingStatus status, String message) {
        if (userPrincipal == null || bookingId == null || status == null || message == null) {
            log.warn("Attempted to send booking update with missing parameters.");
            return;
        }
        String userQueue = "/queue/bookings"; // Spring prepends /user/{userPrincipal}
        Map<String, String> payload = Map.of(
                "type", "BOOKING_STATUS_UPDATE",
                "bookingId", bookingId,
                "status", status.name(),
                "message", message
        );
        log.info("Sending booking update to user '{}' via {}: {}", userPrincipal, userQueue, payload);
        messagingTemplate.convertAndSendToUser(userPrincipal, userQueue, payload);
    }

    /**
     * Notifies a driver about a new booking request for one of their rides.
     *
     * @param driverPrincipal The principal name of the driver (e.g., email).
     * @param bookingId The ID of the new booking request.
     * @param passengerName The name/username of the passenger who made the request.
     * @param rideDepartureCity Departure city of the ride.
     * @param rideDestinationCity Destination city of the ride.
     */
    public void sendBookingRequestNotification(String driverPrincipal, String bookingId, String passengerName, String rideDepartureCity, String rideDestinationCity) {
        if (driverPrincipal == null || bookingId == null) {
            log.warn("Attempted to send booking request notification with missing driverPrincipal or bookingId.");
            return;
        }
        String userQueue = "/queue/bookings"; // Driver also listens on their booking queue for requests
        String message = String.format("New booking request from %s for your ride from %s to %s. Booking ID: %s",
                passengerName, rideDepartureCity, rideDestinationCity, bookingId);
        Map<String, String> payload = Map.of(
                "type", "NEW_BOOKING_REQUEST",
                "bookingId", bookingId,
                "passengerName", passengerName != null ? passengerName : "A passenger",
                "rideInfo", String.format("%s to %s", rideDepartureCity, rideDestinationCity),
                "message", message
        );
        log.info("Sending new booking request notification to driver '{}': {}", driverPrincipal, payload);
        messagingTemplate.convertAndSendToUser(driverPrincipal, userQueue, payload);
    }

    /**
     * Notifies a driver that a passenger has cancelled their booking.
     *
     * @param driverPrincipal The principal name of the driver.
     * @param bookingId The ID of the cancelled booking.
     * @param passengerName The name/username of the passenger who cancelled.
     * @param rideDepartureCity Departure city of the ride.
     * @param rideDestinationCity Destination city of the ride.
     */
    public void sendPassengerCancellationNotification(String driverPrincipal, String bookingId, String passengerName, String rideDepartureCity, String rideDestinationCity) {
         if (driverPrincipal == null || bookingId == null) {
            log.warn("Attempted to send passenger cancellation notification with missing driverPrincipal or bookingId.");
            return;
        }
        String userQueue = "/queue/bookings";
        String message = String.format("Passenger %s has cancelled their booking (ID: %s) for your ride from %s to %s.",
                                       passengerName, bookingId, rideDepartureCity, rideDestinationCity);
        Map<String, String> payload = Map.of(
                "type", "PASSENGER_BOOKING_CANCELLATION",
                "bookingId", bookingId,
                "passengerName", passengerName != null ? passengerName : "A passenger",
                "rideInfo", String.format("%s to %s", rideDepartureCity, rideDestinationCity),
                "message", message
        );
        log.info("Sending passenger cancellation notification to driver '{}': {}", driverPrincipal, payload);
        messagingTemplate.convertAndSendToUser(driverPrincipal, userQueue, payload);
    }

    // You can add more specific notification methods as needed, e.g., for chat notifications,
    // or for document status updates.
    public void sendDocumentStatusUpdate(String userPrincipal, String documentType, DocumentStatus status, String reason) {
        if (userPrincipal == null || documentType == null || status == null) {
            log.warn("Attempted to send document status update with missing parameters.");
            return;
        }
        String userQueue = "/queue/documents"; // Or a general "/queue/notifications"
        String message = String.format("Your document (%s) status has been updated to %s.", documentType, status);
        if (status == DocumentStatus.REJECTED && reason != null && !reason.isBlank()) {
            message += " Reason: " + reason;
        }
        Map<String, String> payload = Map.of(
                "type", "DOCUMENT_STATUS_UPDATE",
                "documentType", documentType,
                "status", status.name(),
                "reason", (reason != null && status == DocumentStatus.REJECTED) ? reason : "",
                "message", message
        );
        log.info("Sending document status update to user '{}': {}", userPrincipal, payload);
        messagingTemplate.convertAndSendToUser(userPrincipal, userQueue, payload);
    }
}