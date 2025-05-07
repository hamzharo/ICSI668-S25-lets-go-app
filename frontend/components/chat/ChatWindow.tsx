// frontend/components/chat/ChatWindow.tsx
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ChatMessage, ChatMessageSendPayload } from '@/types';
import ChatMessageItem from './ChatMessageItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Using Textarea for better multiline input
import { useAuth } from '@/lib/AuthContext';
import { useWebSocket } from '@/lib/WebSocketContext';
import { Loader2, Send, CornerDownLeft, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import { StompSubscription } from '@stomp/stompjs';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // For scrollable message list


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// --- TODO: Replace with actual API service calls ---
const fetchChatHistoryApi = async (rideId: string, token: string | null): Promise<ChatMessage[]> => {
  if (!token) throw new Error("Authentication required to fetch chat history.");
  console.log(`API CALL: Fetching chat history for ride ${rideId}`);
  // const response = await fetch(`${API_BASE_URL}/api/chat/ride/${rideId}/history`, {
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // if (!response.ok) {
  //   const errorResult = await response.json().catch(() => ({ message: "Failed to fetch chat history." }));
  //   throw new Error(errorResult.message);
  // }
  // return response.json();

  // Mock API response:
  return new Promise(resolve => setTimeout(() => {
    resolve([
      { id: 'chat1', rideId, senderId: 'driver_mock_123', senderFirstName: 'Samantha', content: 'Hi everyone! Looking forward to the ride.', timestamp: new Date(Date.now() - 300000).toISOString() },
      { id: 'chat2', rideId, senderId: 'passenger_mock_abc', senderFirstName: 'Alex', content: 'Hello! Me too. Quick question, is there space for a small backpack?', timestamp: new Date(Date.now() - 240000).toISOString() },
      { id: 'chat3', rideId, senderId: 'driver_mock_123', senderFirstName: 'Samantha', content: 'Yes, Alex, a small backpack is fine!', timestamp: new Date(Date.now() - 180000).toISOString() },
    ]);
  }, 800));
};
// --- End TODO ---


interface ChatWindowProps {
  rideId: string;
}

const ChatWindow = ({ rideId }: ChatWindowProps) => {
  const { user, token, isLoading: authLoading } = useAuth();
  const { stompClient, isConnected, subscribe, publish } = useWebSocket();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null); // For auto-scrolling
  const chatSubscriptionRef = useRef<StompSubscription | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch chat history
  useEffect(() => {
    if (rideId && token && user) {
      setIsLoadingHistory(true);
      setError(null);
      fetchChatHistoryApi(rideId, token)
        .then(history => {
          // Mark own messages before setting state
          const markedHistory = history.map(msg => ({ ...msg, isOwnMessage: msg.senderId === user.id }));
          setMessages(markedHistory);
        })
        .catch(err => {
          console.error("Failed to load chat history:", err);
          setError(err.message || "Could not load chat history.");
          toast.error(err.message || "Failed to load chat history.");
        })
        .finally(() => setIsLoadingHistory(false));
    }
  }, [rideId, token, user]); // user dependency to mark own messages correctly

  // WebSocket subscription for new chat messages
  useEffect(() => {
    if (isConnected && stompClient && rideId && user && !chatSubscriptionRef.current) {
      const destination = `/topic/ride/${rideId}/chat`;
      console.log(`Chat: Subscribing to ${destination}`);
      chatSubscriptionRef.current = subscribe(destination, (message) => {
        console.log(`Chat: Received message on ${destination}:`, message.body);
        try {
          const receivedMessage: ChatMessage = JSON.parse(message.body);
          // Mark if it's an own message (though backend might already provide sender info)
          // This helps if the broadcast doesn't explicitly tell the sender it's their own.
          const markedMessage = { ...receivedMessage, isOwnMessage: receivedMessage.senderId === user.id };
          setMessages((prevMessages) => [...prevMessages, markedMessage]);
        } catch (e) {
          console.error("Error processing WebSocket chat message:", e);
        }
      });
    }
    // Cleanup on unmount or if dependencies change causing re-subscription
    return () => {
      if (chatSubscriptionRef.current) {
        console.log(`Chat: Unsubscribing from /topic/ride/${rideId}/chat`);
        chatSubscriptionRef.current.unsubscribe();
        chatSubscriptionRef.current = null; // Reset ref
      }
    };
  }, [isConnected, stompClient, rideId, user, subscribe]); // Ensure user is in dependency array for isOwnMessage logic

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !stompClient || !stompClient.connected || !user) return;

    setIsSending(true);
    const payload: ChatMessageSendPayload = {
      // rideId, // Not needed in payload if using /app/ride/{rideId}/...
      content: newMessage.trim(),
      // senderId will be set by backend based on authenticated principal
    };

    const sendDestination = `/app/ride/${rideId}/chat.sendMessage`;
    console.log(`Chat: Publishing to ${sendDestination}`, payload);
    try {
        publish(sendDestination, JSON.stringify(payload));
        setNewMessage(''); // Clear input after sending
        // Optimistic update could be done here, but usually rely on receiving own message back via subscription
    } catch (err: any) {
        toast.error(err.message || "Failed to send message.");
        console.error("Failed to send chat message via WebSocket:", err);
    } finally {
        setIsSending(false);
        // Focus input again
        document.getElementById('chat-message-input')?.focus();
    }
  };

  if (authLoading) {
    return <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /> Authenticating...</div>;
  }
  if (!user) {
    return <div className="p-4 text-center text-sm text-muted-foreground">Please log in to use chat.</div>;
  }

  if (isLoadingHistory) {
    return <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /> Loading chat history...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col h-[400px] md:h-[500px] border rounded-lg shadow-md bg-white dark:bg-gray-800">
      <header className="p-3 border-b dark:border-gray-700 flex items-center">
        <MessageSquare className="h-5 w-5 mr-2 text-primary" />
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">Ride Chat</h3>
      </header>

      <ScrollArea className="flex-grow p-3 space-y-2">
        {messages.length === 0 && !isLoadingHistory && (
          <p className="text-center text-sm text-muted-foreground py-4">No messages yet. Start the conversation!</p>
        )}
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} currentUserId={user.id} />
        ))}
        <div ref={messagesEndRef} /> {/* Anchor for auto-scrolling */}
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-3 border-t dark:border-gray-700 flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50">
        <Textarea
          id="chat-message-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          rows={1} // Start with 1 row, auto-expands with content or CSS
          className="flex-grow resize-none p-2 border rounded-md focus:ring-1 focus:ring-primary dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 min-h-[40px] max-h-[120px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={!isConnected || isSending}
        />
        <Button type="submit" size="icon" disabled={!isConnected || isSending || !newMessage.trim()}>
          {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          <span className="sr-only">Send</span>
        </Button>
      </form>
      {!isConnected && <p className="text-xs text-red-500 px-3 pb-1 text-center">Chat disconnected. Attempting to reconnect...</p>}
    </div>
  );
};

export default ChatWindow;