package com.carsharing.backend.controller;

import com.carsharing.backend.dto.ChatMessageDTO;
import com.carsharing.backend.exception.ResourceNotFoundException;
import com.carsharing.backend.model.BookingStatus;
import com.carsharing.backend.model.ChatMessage;
import com.carsharing.backend.model.Ride;
import com.carsharing.backend.model.User;
import com.carsharing.backend.repository.BookingRepository;
import com.carsharing.backend.repository.ChatMessageRepository;
import com.carsharing.backend.repository.RideRepository;
import com.carsharing.backend.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort; // Import for sorting
import org.springframework.http.HttpStatus; // Import HttpStatus
import org.springframework.http.ResponseEntity; // Import for REST response
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize; // Import for security
import org.springframework.security.core.Authentication; // Import Authentication
import org.springframework.security.core.context.SecurityContextHolder; // Import SecurityContextHolder
import org.springframework.web.bind.annotation.GetMapping; // Import for GET mapping
import org.springframework.web.bind.annotation.PathVariable; // Import for path variable
import org.springframework.web.bind.annotation.RequestMapping; // Import for base path
import org.springframework.web.bind.annotation.RestController; // USE RestController for mixed endpoints

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.ArrayList; // Import ArrayList
import java.util.List; // Import List
import java.util.Set;
import java.util.stream.Collectors; // Import Collectors

@RestController // Use @RestController to handle both @MessageMapping and @GetMapping
@RequestMapping("/api/chat") // Base path for REST endpoints related to chat
public class ChatController {

    // Declare the logger
    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    @Autowired private SimpMessagingTemplate messagingTemplate;
    @Autowired private ChatMessageRepository chatMessageRepository;
    @Autowired private RideRepository rideRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private UserRepository userRepository;

    /**
     * Handles incoming WebSocket messages sent to destinations like "/app/ride/{rideId}/chat.sendMessage".
     * Validates the sender, saves the message, and broadcasts it to the ride-specific topic.
     *
     * @param incomingMessage DTO containing the message content (potentially other fields if needed).
     * @param rideId          The ID of the ride extracted from the destination path.
     * @param principal       Represents the authenticated sender of the WebSocket message.
     */
    @MessageMapping("/ride/{rideId}/chat.sendMessage") // Listens for messages sent to /app/ride/{rideId}/chat.sendMessage
    public void sendMessage(@Payload ChatMessageDTO incomingMessage,
                            @DestinationVariable String rideId,
                            Principal principal) { // Principal represents the authenticated sender

        if (principal == null) {
             log.error("Cannot send chat message without authenticated principal for ride {}", rideId);
             // Cannot easily send error back without more complex setup, so just return.
             return;
        }
        String senderEmail = principal.getName(); // Get sender's email (assuming email is username)

        // --- Security Check & Validation ---
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> {
                    // Should not happen if Principal exists, but handle defensively
                    log.error("Authenticated principal {} not found in user repository.", senderEmail);
                    return new ResourceNotFoundException("Sender not found: " + senderEmail);
                });
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found for chat: " + rideId));

        // Verify sender is part of this ride's chat (driver or confirmed passenger)
        boolean isDriver = ride.getDriverId().equals(sender.getId());
     boolean isConfirmedPassenger = bookingRepository.existsByRideIdAndPassengerIdAndStatusIn(
                                        rideId, sender.getId(), Set.of(BookingStatus.CONFIRMED));

        if (!isDriver && !isConfirmedPassenger) {
            log.warn("Unauthorized chat message attempt by user {} ({}) for ride {}", senderEmail, sender.getId(), rideId);
            // Optionally send error back to sender only? Requires more setup. For now, just don't process/broadcast.
            return;
        }
        // --- End Security Check ---


        // --- Process and Save Message ---
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setRideId(rideId);
        chatMessage.setSenderId(sender.getId());
        chatMessage.setSenderRole(isDriver ? "DRIVER" : "PASSENGER"); // Set role
        // Validate content if necessary (e.g., not empty)
        if(incomingMessage.getContent() == null || incomingMessage.getContent().trim().isEmpty()) {
            log.warn("Empty chat message received from user {} for ride {}", senderEmail, rideId);
            return; // Don't save or broadcast empty messages
        }
        chatMessage.setContent(incomingMessage.getContent().trim()); // Get content from payload, trim whitespace
        chatMessage.setTimestamp(LocalDateTime.now()); // Set server timestamp

        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

        // --- Prepare Outgoing DTO ---
        // Reuse ChatMessageDTO or create a specific OutgoingChatMessageDTO if needed
        ChatMessageDTO outgoingDto = new ChatMessageDTO(
            savedMessage.getContent(),
            savedMessage.getRideId(),
            savedMessage.getSenderId(),
            sender.getName(), // Add sender name
            savedMessage.getSenderRole(),
            savedMessage.getTimestamp()
        );

        // --- Broadcast Message to Ride Topic ---
        String destination = "/topic/ride/" + rideId + "/chat"; // Topic for all participants of this ride
        log.info("Sending chat message to {}: {}", destination, outgoingDto);
        messagingTemplate.convertAndSend(destination, outgoingDto);
    }


    /**
     * REST endpoint to fetch chat message history for a specific ride.
     * Secured to ensure only the driver or confirmed passengers of the ride can access it.
     *
     * @param rideId The ID of the ride.
     * @return ResponseEntity containing a list of ChatMessageDTOs or an error.
     */
    @GetMapping("/ride/{rideId}/history")
    // Replace isAuthenticated() with fine-grained security, e.g., @PreAuthorize("@chatSecurityService.canViewChat(#rideId, principal)")
    @PreAuthorize("isAuthenticated()") // Start with basic authentication check
    public ResponseEntity<List<ChatMessageDTO>> getChatHistory(@PathVariable String rideId) {
        log.info("Fetching chat history for ride ID: {}", rideId);

        // --- Basic Security Check (can be enhanced later) ---
        // Get current user and verify they are part of the ride (driver or confirmed passenger)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
            log.warn("Unauthenticated attempt to access chat history for ride {}", rideId);
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ArrayList<>());
        }
        String userEmail = authentication.getName(); // Assumes email is principal

        User currentUser;
        Ride ride;
        try {
             currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found: " + userEmail));
             ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found for chat history: " + rideId));
        } catch (ResourceNotFoundException e) {
             log.warn("Resource not found during chat history access for ride {}: {}", rideId, e.getMessage());
             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ArrayList<>());
        }


        boolean isDriver = ride.getDriverId().equals(currentUser.getId());
        boolean isConfirmedPassenger = bookingRepository.existsByRideIdAndPassengerIdAndStatusIn(
                                            rideId, currentUser.getId(), Set.of(BookingStatus.CONFIRMED));

        if (!isDriver && !isConfirmedPassenger) {
            log.warn("Unauthorized attempt to access chat history by user {} ({}) for ride {}", userEmail, currentUser.getId(), rideId);
            // Return 403 Forbidden if user is not part of the ride chat
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ArrayList<>()); // Return empty list with 403
        }
        // --- End Basic Security Check ---


        // --- Fetch and Convert Messages ---
        try {
            // Fetch messages sorted by timestamp ascending
            List<ChatMessage> messages = chatMessageRepository.findByRideId(
                rideId, Sort.by(Sort.Direction.ASC, "timestamp") // Use Sort object
            );

            // Convert entities to DTOs (including sender name)
            // Optimization Note: If chat history is long, fetching all user names individually can be slow.
            // Consider fetching all relevant user IDs first, then getting their names in one query.
            List<ChatMessageDTO> messageDTOs = messages.stream()
                .map(msg -> {
                    // Fetch sender name (handle potential user not found)
                    String senderName = userRepository.findById(msg.getSenderId())
                                                     .map(User::getName)
                                                     .orElse("Unknown User"); // Default if user somehow deleted

                    // Use the all-args constructor of ChatMessageDTO
                    return new ChatMessageDTO(
                        msg.getContent(),
                        msg.getRideId(),
                        msg.getSenderId(),
                        senderName, // Include sender name
                        msg.getSenderRole(),
                        msg.getTimestamp()
                    );
                })
                .collect(Collectors.toList());

            return ResponseEntity.ok(messageDTOs);

        } catch (Exception e) {
            log.error("Error fetching chat history for ride {}: {}", rideId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>()); // Return empty list on error
        }
    }

} // End of ChatController class