// frontend/components/chat/RideChat.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { useAuth } from '@/lib/AuthContext'; // Your auth context
import { ChatMessage, ChatMessageSendPayload } from '@/types';
import { getChatHistoryApi } from '@/lib/api/chat'; // Your API function
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, SendHorizonal, AlertCircle, WifiOff } from 'lucide-react';
import { toast } from 'react-toastify';

interface RideChatProps {
  rideId: string;
}

const RideChat: React.FC<RideChatProps> = ({ rideId }) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Effect for fetching initial chat history
  useEffect(() => {
    if (!rideId || !token) return;

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      setError(null);
      try {
        const history = await getChatHistoryApi(rideId, token);
        // Add client-side flag for own messages
        setMessages(history.map(msg => ({ ...msg, isOwnMessage: msg.senderId === user?.id })));
      } catch (err: any) {
        console.error("Failed to fetch chat history:", err);
        setError(err.message || "Could not load chat history.");
        toast.error(err.message || "Could not load chat history.");
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [rideId, token, user?.id]);


  // Effect for WebSocket connection and subscription
  useEffect(() => {
    if (!rideId || !token || !user) return;

    const client = new Client({
      brokerURL: `${process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080/ws'}`, // Your WebSocket endpoint
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: function (str) {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      setIsConnected(true);
      toast.success("Chat connected!");
      console.log('Connected to WebSocket chat server:', frame);

      subscriptionRef.current = client.subscribe(`/topic/ride/${rideId}/chat`, (message: IMessage) => {
        try {
          const receivedMessage: ChatMessage = JSON.parse(message.body);
          console.log("Received message:", receivedMessage);
          setMessages((prevMessages) => [
            ...prevMessages,
            { ...receivedMessage, isOwnMessage: receivedMessage.senderId === user.id },
          ]);
        } catch (e) {
          console.error("Error parsing received message:", e, message.body);
        }
      });
    };

    client.onDisconnect = () => {
      setIsConnected(false);
      toast.warn("Chat disconnected. Attempting to reconnect...");
      console.log('Disconnected from WebSocket chat server');
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
      setError(`Chat connection error: ${frame.headers['message'] || 'Unknown STOMP error'}`);
      toast.error(`Chat error: ${frame.headers['message']}`);
      setIsConnected(false); // Ensure disconnected state is set
    };
    
    client.activate();
    setStompClient(client);

    return () => {
      console.log("Deactivating STOMP client for rideId:", rideId);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (client && client.active) { // Check if client is active before deactivating
        client.deactivate().catch(e => console.warn("Error during STOMP client deactivation:", e));
      }
      setIsConnected(false); // Ensure disconnected state on component unmount
    };
  }, [rideId, token, user]); // Rerun if rideId, token, or user changes

  const handleSendMessage = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (newMessage.trim() && stompClient && isConnected && user) {
      const payload: ChatMessageSendPayload = {
        content: newMessage.trim(),
        // rideId and senderId are implicitly handled by backend via destination and Principal
      };
      try {
        stompClient.publish({
          destination: `/app/ride/${rideId}/chat.sendMessage`,
          body: JSON.stringify(payload),
        });
        setNewMessage('');
      } catch (publishError) {
        console.error("Error publishing message:", publishError);
        toast.error("Could not send message. Please try again.");
      }
    } else if (!isConnected) {
        toast.warn("Chat not connected. Cannot send message.");
    }
  };

  if (!user) {
    return <div className="p-4 text-center text-muted-foreground">Please log in to chat.</div>;
  }

  return (
    <div className="flex flex-col h-[500px] max-h-[70vh] border rounded-lg shadow-sm">
      <div className="p-3 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-800">
        <h3 className="font-semibold text-lg">Ride Chat</h3>
        <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'}></div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-white dark:bg-slate-900">
        {isLoadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading messages...</span>
          </div>
        ) : messages.length === 0 && !error ? (
          <div className="text-center text-muted-foreground py-10">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => ( // Use index for key if msg.id is not reliably unique from backend DTO
            <div key={msg.id || `${msg.senderId}-${msg.timestamp}-${index}`} className={`flex ${msg.isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-2.5 rounded-lg shadow ${
                  msg.isOwnMessage 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                {!msg.isOwnMessage && (
                  <p className="text-xs font-semibold mb-0.5 opacity-80">{msg.senderFirstName || 'User'}{msg.senderRole && ` (${msg.senderRole})`}</p>
                )}
                <p className="text-sm break-words">{msg.content}</p>
                <p className={`text-xs mt-1 opacity-70 ${msg.isOwnMessage ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isConnected ? "Type your message..." : "Connecting to chat..."}
          className="flex-grow"
          disabled={!isConnected || isLoadingHistory}
        />
        <Button type="submit" disabled={!isConnected || isLoadingHistory || newMessage.trim() === ''} size="icon">
          <SendHorizonal className="h-5 w-5" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
};

export default RideChat;