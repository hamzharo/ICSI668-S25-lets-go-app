// frontend/app/(root)/passenger/inbox/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext'; // Your auth context
import { useRouter } from 'next/navigation';
import { PassengerConversationPreview } from '@/types';
import { getMyPassengerConversationsApi } from '@/lib/api/chat'; // Your API function
import RideChat from '@/components/chat/RideChat'; // The chat component from previous response
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquareText, InboxIcon } from 'lucide-react'; // InboxIcon might need custom or alternative
import { toast } from 'react-toastify';
import { Separator } from '@/components/ui/separator';

export default function PassengerInboxPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<PassengerConversationPreview[]>([]);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        toast.error("Please log in to view your inbox.");
        router.push('/login'); // Or your login page
        return;
      }
      if (user.roles && !user.roles.includes('PASSENGER')) {
         toast.warn("This inbox is for passengers.");
         // router.push('/dashboard'); // Or appropriate dashboard
      }

      const fetchConversations = async () => {
        setIsLoadingConversations(true);
        setError(null);
        try {
          const convos = await getMyPassengerConversationsApi(token);
          setConversations(convos);
        } catch (err: any) {
          console.error("Failed to fetch conversations:", err);
          setError(err.message || "Could not load your conversations.");
          toast.error(err.message || "Could not load your conversations.");
        } finally {
          setIsLoadingConversations(false);
        }
      };
      fetchConversations();
    }
  }, [user, token, authLoading, router]);

  const handleSelectConversation = (rideId: string) => {
    setSelectedRideId(rideId);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0]?.toUpperCase() || '';
    const last = lastName?.[0]?.toUpperCase() || '';
    return first && last ? `${first}${last}` : first || 'U';
  };
  
  const formatPreviewTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };


  if (authLoading) {
    return (
      <div className="flex flex-grow items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
      return <div className="p-6 text-center">Redirecting to login...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Inbox</h1>
        <p className="text-muted-foreground">Your conversations with drivers.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Conversations List Sidebar */}
        <Card className="w-full md:w-1/3 lg:w-1/4 md:max-h-[calc(100vh-150px)] md:overflow-y-auto">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-xl">Conversations ({conversations.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingConversations ? (
              <div className="p-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="mt-2 text-muted-foreground">Loading chats...</p>
              </div>
            ) : error ? (
               <div className="p-4 text-red-600 text-center">{error}</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <InboxIcon className="h-12 w-12 mx-auto mb-2 opacity-50" /> {/* Replace with actual InboxIcon if available */}
                No active conversations.
                <br/>
                Chats will appear here for your confirmed rides.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {conversations.map((convo) => (
                  <li key={convo.rideId}>
                    <button
                      onClick={() => handleSelectConversation(convo.rideId)}
                      className={`w-full text-left p-4 hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors ${selectedRideId === convo.rideId ? 'bg-muted dark:bg-muted/30' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={convo.driverProfilePictureUrl} alt={`${convo.driverFirstName}'s avatar`} />
                          <AvatarFallback>{getInitials(convo.driverFirstName, convo.driverLastName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            Driver: {convo.driverFirstName} {convo.driverLastName || ''}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            Ride to {convo.rideDestinationCity}
                          </p>
                           {convo.lastMessageSnippet && (
                            <p className="text-xs text-muted-foreground truncate italic mt-0.5">
                                {convo.lastMessageSnippet}
                            </p>
                           )}
                        </div>
                        <div className="text-right text-xs text-muted-foreground space-y-1">
                            {convo.lastMessageTimestamp && <span>{formatPreviewTime(convo.lastMessageTimestamp)}</span>}
                            {convo.unreadCount && convo.unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-auto block w-fit">{convo.unreadCount}</Badge>
                            )}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <div className="flex-grow md:w-2/3 lg:w-3/4">
          {selectedRideId ? (
            <RideChat rideId={selectedRideId} />
          ) : (
            <Card className="h-full flex flex-col items-center justify-center min-h-[300px] md:min-h-[500px]">
              <CardContent className="text-center">
                <MessageSquareText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground">
                  Select a conversation to start chatting.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}