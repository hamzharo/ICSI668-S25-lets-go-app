package com.carsharing.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // Enables WebSocket message handling, backed by a message broker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // This is the HTTP URL that clients will connect to initially for the WebSocket handshake.
        // '/ws' is a common convention.
        registry.addEndpoint("/api/ws") // Endpoint path (e.g., http://localhost:8080/api/ws)
                // Allow connections from your frontend origin (replace if different)
                .setAllowedOrigins("http://localhost:3000")
                // Use SockJS as a fallback for browsers/proxies that don't support WebSocket directly.
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Defines prefixes for message destinations that are handled by @MessageMapping methods
        // in your controllers (if you were building full chat, etc.). We might not use this much initially.
        registry.setApplicationDestinationPrefixes("/app"); // e.g., client sends to /app/chat

        // Defines prefixes for destinations that the message broker handles directly (broadcasting).
        // enableSimpleBroker enables an in-memory broker.
        // '/topic' is typically used for broadcast messages (one-to-many).
        // '/user' is used for user-specific messages (one-to-one). Spring maps /user/{userId}/... destinations.
        registry.enableSimpleBroker("/topic", "/user");

        // Configures the prefix used for user-specific destinations.
        // When you send to /user/{userId}/queue/something, Spring ensures only that user receives it.
        registry.setUserDestinationPrefix("/user");
    }
}