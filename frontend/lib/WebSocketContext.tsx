// frontend/lib/WebSocketContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext'; // To get the JWT token

interface WebSocketContextType {
  stompClient: Client | null;
  isConnected: boolean;
  subscribe: (destination: string, callback: (message: IMessage) => void) => StompSubscription | null;
  publish: (destination: string, body?: string, headers?: Record<string, any>) => void;
  // You can add specific functions for common subscriptions if needed
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const WEBSOCKET_URL = `${process.env.NEXT_PUBLIC_API_URL_WS || process.env.NEXT_PUBLIC_API_URL?.replace(/^http/, 'ws')}/api/ws`;
// Note: If your API_URL is http://localhost:8080, NEXT_PUBLIC_API_URL_WS might be ws://localhost:8080
// Or you can hardcode it if it's fixed: const WEBSOCKET_URL = 'ws://localhost:8080/api/ws';


export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { token, user } = useAuth(); // Get token and user from AuthContext
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Record<string, StompSubscription>>({});


  useEffect(() => {
    if (token && user && !stompClient) { // Only connect if token and user exist and client not already set
      console.log('Attempting to connect WebSocket...');

      const client = new Client({
        // brokerURL: WEBSOCKET_URL, // For direct WebSocket
        webSocketFactory: () => new SockJS(WEBSOCKET_URL.replace(/^ws/, 'http')), // For SockJS
        connectHeaders: {
          // Spring Security typically uses the Authorization header for STOMP over WebSockets
          // If your backend extracts it from STOMP headers:
          'Authorization': `Bearer ${token}`,
          // Or if it relies on the HTTP session/cookie after initial handshake on same domain,
          // this might not be strictly necessary but good for explicitness.
        },
        debug: (str) => {
          console.log('STOMP: ' + str);
        },
        reconnectDelay: 5000, // Try to reconnect every 5 seconds
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = (frame) => {
        console.log('WebSocket Connected: ' + frame);
        setIsConnected(true);
        // After connection, set up user-specific queues
        // Example: Subscribe to user-specific booking notifications
        const userQueueSubscription = client.subscribe(`/user/queue/bookings`, (message) => {
          console.log('Received user booking notification:', message.body);
          try {
            const notificationPayload = JSON.parse(message.body);
            // Example: { type: 'BOOKING_CONFIRMED', bookingId: '123', rideId: '456', message: 'Your booking was confirmed!' }
            toast.info(notificationPayload.message || `Booking update: ${notificationPayload.type}`);
            // You might want more sophisticated toast messages based on notificationPayload.type
          } catch (e) {
            toast.info(`Notification: ${message.body}`);
          }
        });
        setSubscriptions(prev => ({ ...prev, '/user/queue/bookings': userQueueSubscription }));

        // You might want to resubscribe to any general topics here if needed upon reconnect
      };

      client.onDisconnect = () => {
        console.log('WebSocket Disconnected');
        setIsConnected(false);
        setSubscriptions({}); // Clear subscriptions on disconnect
      };

      client.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        setIsConnected(false); // Ensure disconnected state on STOMP error
      };

      client.activate(); // Connect
      setStompClient(client);

      return () => {
        console.log('Cleaning up WebSocket connection...');
        if (client && client.active) {
          // Unsubscribe from all managed subscriptions
          Object.values(subscriptions).forEach(sub => sub?.unsubscribe());
          client.deactivate();
          console.log('WebSocket Deactivated.');
        }
        setStompClient(null);
        setIsConnected(false);
        setSubscriptions({});
      };
    } else if (!token && !user && stompClient && stompClient.active) {
        // If user logs out, deactivate client
        console.log('User logged out, deactivating WebSocket client.');
        Object.values(subscriptions).forEach(sub => sub?.unsubscribe());
        stompClient.deactivate();
        setStompClient(null);
        setIsConnected(false);
        setSubscriptions({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]); // Rerun effect if token or user changes (e.g., login/logout)

  const subscribe = useCallback((destination: string, callback: (message: IMessage) => void): StompSubscription | null => {
    if (stompClient && stompClient.connected) {
      console.log(`Subscribing to ${destination}`);
      const subscription = stompClient.subscribe(destination, callback);
      setSubscriptions(prev => ({ ...prev, [destination]: subscription }));
      return subscription;
    }
    console.warn('STOMP client not connected, cannot subscribe to', destination);
    return null;
  }, [stompClient]);

  const publish = useCallback((destination: string, body?: string, headers?: Record<string, any>) => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination, body, headers });
    } else {
      console.warn('STOMP client not connected, cannot publish to', destination);
    }
  }, [stompClient]);

  return (
    <WebSocketContext.Provider value={{ stompClient, isConnected, subscribe, publish }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};