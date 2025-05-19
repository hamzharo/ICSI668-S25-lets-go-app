import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowRight } from 'lucide-react';
// import { getCurrentUser } from '@/lib/auth/actions'; //  Temporarily remove for demo
// import { User } from '@/types'; // Temporarily remove for demo
// import { redirect } from 'next/navigation'; // Temporarily remove for demo
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Driver Inbox (Demo)',
  description: 'Manage your conversations with passengers for your rides.',
};

// Mock data for rides - This will be static for the demo
interface MockRideForInbox {
  id: string;
  destination: string;
  departureTime: string;
  passengerCount: number;
  lastMessageSnippet?: string;
  unreadCount?: number;
}

// Static mock ride data directly in the component
const MOCK_RIDES_FOR_INBOX: MockRideForInbox[] = [
  {
    id: 'demoRide001', // Use a distinct ID for demo
    destination: 'City Center Conference Hall',
    departureTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Approx. 2 days from now
    passengerCount: 2,
    lastMessageSnippet: "Passenger A: Sounds good, see you then!",
    unreadCount: 1,
  },
  {
    id: 'demoRide002',
    destination: 'Grand Airport Hotel',
    departureTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Approx. 3 days from now
    passengerCount: 1,
    lastMessageSnippet: "You: I'll be there right on time.",
  },
  {
    id: 'demoRide003',
    destination: 'Tech Park North',
    departureTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Approx. 5 days from now
    passengerCount: 3,
    // No messages yet for this ride
  },
];

// For the demo, we'll make this page a client component to avoid server-side data fetching issues for now.
// Or, keep it a server component but just use the static MOCK_RIDES_FOR_INBOX directly.
// Let's keep it as a server component for consistency with Next.js patterns, but simplify data source.

const DriverInboxPage = async () => {
  // const currentUser = await getCurrentUser(); // TEMPORARILY COMMENTED OUT
  // if (!currentUser || currentUser.role !== 'DRIVER') { // TEMPORARILY COMMENTED OUT
  //   redirect('/login?error=unauthorized'); // TEMPORARILY COMMENTED OUT
  // }

  // Directly use the static mock data
  const ridesForInbox = MOCK_RIDES_FOR_INBOX;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Driver Inbox (Demo Mode)</h1>
        <p className="text-lg text-muted-foreground">
          View and manage communications for your scheduled rides.
        </p>
      </header>

      {ridesForInbox.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium text-foreground">No Active Conversations</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    You currently have no rides with active conversations.
                    Chats will appear here once you have upcoming rides with passengers.
                </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {ridesForInbox.map((ride) => (
            <Card key={ride.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">Ride to: {ride.destination}</CardTitle>
                        <CardDescription>
                            Departure: {new Date(ride.departureTime).toLocaleString()}
                            {' '} | {ride.passengerCount} Passenger(s)
                        </CardDescription>
                    </div>
                    {ride.unreadCount && ride.unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                            {ride.unreadCount} New
                        </span>
                    )}
                </div>
              </CardHeader>
              <CardContent>
                {ride.lastMessageSnippet ? (
                  <p className="text-sm text-muted-foreground italic truncate">
                    "{ride.lastMessageSnippet}"
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">No messages yet for this ride.</p>
                )}
                 <div className="mt-4 text-right">
                  <Button asChild variant="ghost" size="sm">
                    {/* Ensure the link points to the dynamic chat page */}
                    <Link href={`/driver/inbox/${ride.id}`}>
                      Open Chat <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverInboxPage;