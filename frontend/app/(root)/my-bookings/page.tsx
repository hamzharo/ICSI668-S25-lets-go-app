// frontend/app/(root)/my-bookings/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { PassengerBooking } from '@/types';
import BookingCard from '@/components/bookings/BookingCard'; // Import the new component
import { toast } from 'react-toastify';
import { Loader2, ListChecks, Frown, Inbox } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

// --- TODO: Replace with actual API service calls ---
const fetchMyBookingsApi = async (token: string | null): Promise<PassengerBooking[]> => {
  if (!token) throw new Error("Authentication required.");
  console.log("API CALL: Fetching my bookings");
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/my-bookings`, { // Adjust endpoint as needed
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // if (!response.ok) {
  //   const errorResult = await response.json().catch(() => ({ message: "Failed to fetch bookings." }));
  //   throw new Error(errorResult.message);
  // }
  // return response.json();

  // Mock API response:
  return new Promise(resolve => setTimeout(() => {
    resolve([
      { bookingId: 'b_mock_1', rideId: 'ride1_mock', rideDetails: { departureCity: 'Springfield', destinationCity: 'Shelbyville', departureTime: new Date(Date.now() + 86400000 * 2).toISOString(), pricePerSeat: 20 }, seatsBooked: 1, totalAmount: 20, status: 'CONFIRMED', bookingDate: new Date(Date.now() - 86400000).toISOString() },
      { bookingId: 'b_mock_2', rideId: 'ride2_mock', rideDetails: { departureCity: 'Capital City', destinationCity: 'Ogdenville', departureTime: new Date(Date.now() + 86400000 * 3).toISOString(), pricePerSeat: 15 }, seatsBooked: 2, totalAmount: 30, status: 'REQUESTED', bookingDate: new Date(Date.now() - 86400000 * 0.5).toISOString() },
      { bookingId: 'b_mock_3', rideId: 'ride3_mock', rideDetails: { departureCity: 'North Haverbrook', destinationCity: 'Brockway', departureTime: new Date(Date.now() - 86400000 * 5).toISOString(), pricePerSeat: 22 }, seatsBooked: 1, totalAmount: 22, status: 'COMPLETED', bookingDate: new Date(Date.now() - 86400000 * 7).toISOString() },
      { bookingId: 'b_mock_4', rideId: 'ride4_mock', rideDetails: { departureCity: 'City A', destinationCity: 'City B', departureTime: new Date(Date.now() + 86400000 * 1).toISOString(), pricePerSeat: 10 }, seatsBooked: 1, totalAmount: 10, status: 'REJECTED_BY_DRIVER', bookingDate: new Date(Date.now() - 86400000 * 1).toISOString() },
    ]);
  }, 1000));
};

const cancelBookingApi = async (bookingId: string, token: string | null): Promise<{ message: string }> => {
  if (!token) throw new Error("Authentication required.");
  console.log(`API CALL: Cancelling booking ${bookingId}`);
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/cancel-by-passenger`, { // Adjust endpoint
  //   method: 'POST', // Or PUT/DELETE depending on backend
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // if (!response.ok) {
  //   const errorResult = await response.json().catch(() => ({ message: "Failed to cancel booking." }));
  //   throw new Error(errorResult.message);
  // }
  // return response.json();

  // Mock API response:
  return new Promise(resolve => setTimeout(() => {
    resolve({ message: "Booking cancelled successfully." });
  }, 800));
};
// --- End TODO ---

export default function MyBookingsPage() {
  const { token, isLoading: authLoading, user } = useAuth();
  const [bookings, setBookings] = useState<PassengerBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null); // To show loading on specific card

  const loadBookings = useCallback(async () => {
    if (!token || !user) { // Ensure user and token are present
        if (!authLoading) setIsLoadingBookings(false); // If auth is done loading and still no token/user
        return;
    }
    setIsLoadingBookings(true);
    setError(null);
    try {
      const fetchedBookings = await fetchMyBookingsApi(token);
      // Sort bookings: active (REQUESTED, CONFIRMED) first, then by departure date (most recent first for past)
      fetchedBookings.sort((a, b) => {
        const activeStatuses = ['REQUESTED', 'CONFIRMED'];
        const aIsActive = activeStatuses.includes(a.status);
        const bIsActive = activeStatuses.includes(b.status);
        if (aIsActive && !bIsActive) return -1;
        if (!aIsActive && bIsActive) return 1;
        return new Date(b.rideDetails.departureTime).getTime() - new Date(a.rideDetails.departureTime).getTime();
      });
      setBookings(fetchedBookings);
    } catch (err: any) {
      console.error("Failed to load bookings:", err);
      setError(err.message || "Could not load your bookings. Please try again.");
      toast.error(err.message || "Failed to load bookings.");
    } finally {
      setIsLoadingBookings(false);
    }
  }, [token, user, authLoading]); // Added authLoading to dependencies

  useEffect(() => {
    if (!authLoading) { // Only load if auth state is resolved
        loadBookings();
    }
  }, [authLoading, loadBookings]);


  const handleCancelBooking = async (bookingId: string) => {
    if (!token) {
      toast.error("Authentication error.");
      return;
    }
    const confirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    setCancellingBookingId(bookingId);
    try {
      const result = await cancelBookingApi(bookingId, token);
      toast.success(result.message);
      // Refresh bookings list or update the specific booking's status locally
      // For simplicity, we'll refetch all bookings.
      // In a more complex app, you might update only the cancelled booking in the state.
      loadBookings();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel booking.");
    } finally {
      setCancellingBookingId(null);
    }
  };


  if (authLoading || (!user && isLoadingBookings)) { // Show loader if auth is loading OR initial bookings load if no user yet
    return <div className="flex flex-grow items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center p-6 text-center">
        <Frown className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Oops! Something went wrong.</h2>
        <p className="text-muted-foreground max-w-md mb-6">{error}</p>
        <Button onClick={loadBookings} variant="outline">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow p-4 md:p-6 lg:p-8 space-y-8">
      <header className="mb-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white flex items-center">
          <ListChecks className="mr-3 h-8 w-8 text-green-600" /> My Bookings
        </h1>
        <p className="text-lg text-muted-foreground dark:text-gray-400">
          Track your ride requests and confirmed bookings.
        </p>
      </header>

      <Separator />

      {isLoadingBookings && bookings.length === 0 && ( // Show loader only if no bookings are displayed yet
          <div className="flex flex-col items-center justify-center text-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Loading your bookings...</p>
          </div>
      )}

      {!isLoadingBookings && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
          <Inbox className="h-20 w-20 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">No Bookings Yet</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            You haven't made any ride bookings or requests. Start by searching for a ride!
          </p>
          <Link href="/search-rides" passHref legacyBehavior>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Find a Ride
            </Button>
          </Link>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.bookingId}
              booking={booking}
              onCancelBooking={handleCancelBooking}
              isCancelling={cancellingBookingId === booking.bookingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}