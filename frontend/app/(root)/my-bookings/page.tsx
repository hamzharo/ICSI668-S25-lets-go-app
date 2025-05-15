// frontend/app/(root)/my-bookings/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { PassengerBooking, RideDetails, BookingStatus } from '@/types'; // Ensure these are correctly defined in types/index.ts
import BookingCard from '@/components/bookings/BookingCard';
import { toast } from 'react-toastify';
import { Loader2, ListChecks, Frown, Inbox } from 'lucide-react';
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Not used in this version
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import PassengerNavigationSidebar from '@/components/sidebars/PassengerNavigationSidebar';


// --- API Service Calls ---
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetches the basic list of bookings for the authenticated passenger.
 * These bookings will NOT initially have rideDetails populated.
 */
const fetchMyBookingsApi = async (token: string | null): Promise<Omit<PassengerBooking, 'rideDetails'>[]> => {
  if (!token) throw new Error("Authentication required.");
  if (!API_URL) throw new Error("API URL not configured.");

  console.log("API CALL: Fetching my bookings (base) from backend");
  const response = await fetch(`${API_URL}/api/passenger/my-bookings`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 204) {
    return [];
  }

  if (!response.ok) {
    const errorResult = await response.json().catch(() => ({ message: "Failed to fetch bookings. Server returned an error." }));
    throw new Error(errorResult.message || "Failed to fetch bookings.");
  }

  return response.json() as Promise<Omit<PassengerBooking, 'rideDetails'>[]>;
};

/**
 * Fetches detailed information for a single ride.
 * Assumes backend endpoint GET /api/rides/{rideId} returns RideDetails.
 */
const fetchRideDetailsApi = async (rideId: string, token: string | null): Promise<RideDetails> => {
  if (!token) throw new Error("Authentication required for ride details.");
  if (!API_URL) throw new Error("API URL not configured for ride details.");
  if (!rideId) { // Add a check for rideId
    console.error("fetchRideDetailsApi called without a rideId.");
    throw new Error("rideId is required to fetch ride details.");
  }

  console.log(`API CALL: Fetching ride details for ride ${rideId} from ${API_URL}/api/rides/${rideId}`); // Updated log
  const response = await fetch(`${API_URL}/api/rides/${rideId}`, { // CORRECTED ENDPOINT
    headers: {
      'Authorization': `Bearer ${token}`,
      // 'Content-Type': 'application/json' // Usually not needed for GET
    }
  });

  if (!response.ok) {
    let errorMessage = `Failed to fetch ride details for ride ${rideId} (Status: ${response.status}).`;
    try {
      const errorResult = await response.json();
      errorMessage = errorResult.message || errorMessage;
    } catch (e) {
      // If parsing JSON fails, the response might not be JSON or might be empty.
      const errorBodyText = await response.text().catch(() => "Could not read error body.");
      if (errorBodyText && errorBodyText.length < 200) {
        errorMessage += ` Server response: ${errorBodyText}`;
      }
    }
    throw new Error(errorMessage);
  }

  const rideDetails: RideDetails = await response.json(); // Parse the JSON response
  console.log(`SUCCESS: Fetched ride details for ride ${rideId}:`, rideDetails);
  return rideDetails; // Return the parsed ride details object
};

/**
 * Cancels a booking.
 */
const cancelBookingApi = async (bookingId: string, token: string | null): Promise<void> => { // Updated to return void if backend returns 200/204 on success
  if (!token) throw new Error("Authentication required.");
  if (!API_URL) throw new Error("API URL not configured.");

  console.log(`API CALL: Cancelling booking ${bookingId} via backend`);
  const response = await fetch(`${API_URL}/api/passenger/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    // Try to parse error message, provide default if parsing fails
    const errorBody = await response.text(); // Get raw text first
    let errorMessage = `Failed to cancel booking (Status: ${response.status})`;
    try {
        const errorResult = JSON.parse(errorBody);
        errorMessage = errorResult.message || errorMessage;
    } catch (e) {
        // If JSON.parse fails, use the raw text if it's not too long, or a generic message
        if (errorBody && errorBody.length < 200) errorMessage = errorBody;
    }
    throw new Error(errorMessage);
  }
  // No need to return response.json() if DELETE returns 200/204 with no body or an irrelevant body
};
// --- End API Service Calls ---

export default function MyBookingsPage() {
  const { token, isLoading: authLoading, user } = useAuth();
  const [bookings, setBookings] = useState<PassengerBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);



  const loadBookings = useCallback(async () => {
    if (!token || !user) {
      if (!authLoading) setIsLoadingBookings(false);
      return;
    }
    setIsLoadingBookings(true);
    setError(null);
    try {
      // Step 1: Fetch initial bookings (which are like Backend's BookingDTO)
      // fetchMyBookingsApi returns: Promise<Omit<PassengerBooking, 'rideDetails'>[]>
      // but the actual raw data from backend has 'id' for bookingId and 'requestedSeats'
      const rawInitialBookings: any[] = await fetchMyBookingsApi(token); // Treat as raw DTO array

      if (rawInitialBookings.length === 0) {
        setBookings([]);
        setIsLoadingBookings(false);
        return;
      }

      // Map raw DTOs to the frontend PassengerBooking structure
      const initialBookings: Omit<PassengerBooking, 'rideDetails'>[] = rawInitialBookings.map(dto => ({
        bookingId: dto.id, // Map 'id' from DTO to 'bookingId'
        rideId: dto.rideId,
        passengerId: dto.passengerId,
        driverId: dto.driverId,
        requestedSeats: dto.requestedSeats, // 'requestedSeats' name matches in DTO and PassengerBooking type
        status: dto.status as BookingStatus, // Ensure status is cast to your BookingStatus enum/type
        bookingTime: dto.bookingTime,
        confirmationTime: dto.confirmationTime,
        cancellationTime: dto.cancellationTime,
        // Any other fields defined on PassengerBooking (excluding rideDetails) should be mapped here if they come from the DTO
      }));

      // Step 2: Fetch ride details for each booking
      const bookingsWithDetailsPromises = initialBookings.map(async (booking) => {
        // 'booking' here now has the correctly mapped 'bookingId' and 'requestedSeats'
        try {
          if (!booking.rideId) {
            console.warn(`Booking ${booking.bookingId} is missing a rideId. Cannot fetch ride details.`);
            return { ...booking, rideDetails: undefined };
          }
          // fetchRideDetailsApi returns RideDetails.
          // Your RideDetails type uses 'id' for the ride's ID, which matches the backend RideDTO.
          const rideDetailsData: RideDetails = await fetchRideDetailsApi(booking.rideId, token);
          return { ...booking, rideDetails: rideDetailsData };
        } catch (rideFetchError: any) {
          console.error(`Failed to fetch ride details for ride ${booking.rideId}:`, rideFetchError.message);
          return { ...booking, rideDetails: undefined }; // Keep the booking, but with undefined rideDetails
        }
      });

      const enrichedBookings = await Promise.all(bookingsWithDetailsPromises);

      // Sort bookings... (your existing sort logic is fine)
      enrichedBookings.sort((a, b) => {
        const activeStatuses = ['REQUESTED', 'CONFIRMED'];
        const aIsActive = a.status && activeStatuses.includes(a.status.toUpperCase());
        const bIsActive = b.status && activeStatuses.includes(b.status.toUpperCase());

        if (aIsActive && !bIsActive) return -1;
        if (!aIsActive && bIsActive) return 1;

        const aDepartureTime = a.rideDetails?.departureTime ? new Date(a.rideDetails.departureTime).getTime() : 0;
        const bDepartureTime = b.rideDetails?.departureTime ? new Date(b.rideDetails.departureTime).getTime() : 0;

        if (aIsActive && bIsActive) {
            if (aDepartureTime === 0 && bDepartureTime !== 0) return 1;
            if (aDepartureTime !== 0 && bDepartureTime === 0) return -1;
            return aDepartureTime - bDepartureTime;
        }
        if (aDepartureTime === 0 && bDepartureTime !== 0) return 1;
        if (aDepartureTime !== 0 && bDepartureTime === 0) return -1;
        return bDepartureTime - aDepartureTime;
      });

      setBookings(enrichedBookings);
    } catch (err: any) {
      console.error("Failed to load bookings:", err);
      setError(err.message || "Could not load your bookings. Please try again.");
      toast.error(err.message || "Failed to load bookings.");
    } finally {
      setIsLoadingBookings(false);
    }
  }, [token, user, authLoading]);



  // const loadBookings = useCallback(async () => {
  //   if (!token || !user) {
  //     if (!authLoading) setIsLoadingBookings(false);
  //     return;
  //   }
  //   setIsLoadingBookings(true);
  //   setError(null);
  //   try {
  //     // Step 1: Fetch initial bookings (without rideDetails)
  //     const initialBookings = await fetchMyBookingsApi(token);

  //     if (initialBookings.length === 0) {
  //       setBookings([]);
  //       setIsLoadingBookings(false);
  //       return;
  //     }

  //     // Step 2: Fetch ride details for each booking
  //     const bookingsWithDetailsPromises = initialBookings.map(async (booking) => {
  //       try {
  //         // Ensure booking.rideId is valid before fetching
  //         if (!booking.rideId) {
  //           console.warn(`Booking ${booking.bookingId} is missing a rideId. Cannot fetch ride details.`);
  //           return { ...booking, rideDetails: undefined };
  //         }
  //         const rideDetailsData = await fetchRideDetailsApi(booking.rideId, token);
  //         return { ...booking, rideDetails: rideDetailsData };
  //       } catch (rideFetchError: any) {
  //         console.error(`Failed to fetch ride details for ride ${booking.rideId}:`, rideFetchError.message);
  //         // Optionally, show a non-blocking toast for individual ride detail failures
  //         // toast.warn(`Could not load full details for one of your rides (ID: ${booking.rideId}). Some information may be missing.`);
  //         return { ...booking, rideDetails: undefined }; // Keep the booking, but with undefined rideDetails
  //       }
  //     });

  //     const enrichedBookings = await Promise.all(bookingsWithDetailsPromises);

  //     // Sort bookings: active (REQUESTED, CONFIRMED) first, then by departure date
  //     enrichedBookings.sort((a, b) => {
  //       const activeStatuses = ['REQUESTED', 'CONFIRMED'];
  //       const aIsActive = a.status && activeStatuses.includes(a.status.toUpperCase());
  //       const bIsActive = b.status && activeStatuses.includes(b.status.toUpperCase());

  //       if (aIsActive && !bIsActive) return -1;
  //       if (!aIsActive && bIsActive) return 1;

  //       // Handle cases where rideDetails or departureTime might be missing (due to fetch error)
  //       const aDepartureTime = a.rideDetails?.departureTime ? new Date(a.rideDetails.departureTime).getTime() : 0;
  //       const bDepartureTime = b.rideDetails?.departureTime ? new Date(b.rideDetails.departureTime).getTime() : 0;

  //       if (aIsActive && bIsActive) {
  //           if (aDepartureTime === 0 && bDepartureTime !== 0) return 1; // a missing time goes last
  //           if (aDepartureTime !== 0 && bDepartureTime === 0) return -1; // b missing time goes last
  //           return aDepartureTime - bDepartureTime; // Earlier first
  //       }
  //       // For past/inactive bookings
  //       if (aDepartureTime === 0 && bDepartureTime !== 0) return 1;
  //       if (aDepartureTime !== 0 && bDepartureTime === 0) return -1;
  //       return bDepartureTime - aDepartureTime; // Most recent first
  //     });

  //     setBookings(enrichedBookings);
  //   } catch (err: any) { // Catch errors from fetchMyBookingsApi primarily
  //     console.error("Failed to load bookings:", err);
  //     setError(err.message || "Could not load your bookings. Please try again.");
  //     toast.error(err.message || "Failed to load bookings.");
  //   } finally {
  //     setIsLoadingBookings(false);
  //   }
  // }, [token, user, authLoading]);

  useEffect(() => {
    if (!authLoading && user && token) {
      loadBookings();
    } else if (!authLoading && (!user || !token)) {
      setIsLoadingBookings(false);
    }
  }, [authLoading, user, token, loadBookings]);


  const handleCancelBooking = async (bookingId: string) => {
    if (!token) {
      toast.error("Authentication error. Please log in again.");
      return;
    }
    const bookingToCancel = bookings.find(b => b.bookingId === bookingId);
    if (!bookingToCancel) {
      toast.error("Booking not found.");
      return;
    }

    const rideInfo = bookingToCancel.rideDetails
      ? `the ride from ${bookingToCancel.rideDetails.departureCity} to ${bookingToCancel.rideDetails.destinationCity}`
      : "this booking";
    const confirmed = window.confirm(`Are you sure you want to cancel ${rideInfo}?`);
    if (!confirmed) return;

    setCancellingBookingId(bookingId);
    try {
      await cancelBookingApi(bookingId, token);
      toast.success("Booking cancelled successfully.");
      loadBookings(); // Refetch all bookings and their details to get the latest state
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel booking.");
    } finally {
      setCancellingBookingId(null);
    }
  };

  // --- Render Logic ---
  if (authLoading || (isLoadingBookings && !user && !error && !bookings.length)) { // Show loader if auth or initial bookings load is in progress
    return <div className="flex flex-grow items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!user && !authLoading) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center p-6 text-center">
        <Frown className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Access Denied</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Please log in to view your bookings.
        </p>
        <Link href="/sign-in" passHref legacyBehavior>
          <Button variant="default">Log In</Button>
        </Link>
      </div>
    );
  }

  if (error && bookings.length === 0) { // Show main error only if no bookings are displayed at all
    return (
      <div className="flex flex-col flex-grow items-center justify-center p-6 text-center">
        <Frown className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Oops! Something went wrong.</h2>
        <p className="text-muted-foreground max-w-md mb-6">{error}</p>
        <Button onClick={loadBookings} variant="outline" disabled={isLoadingBookings}>
          {isLoadingBookings ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Try Again
        </Button>
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



      {isLoadingBookings && bookings.length === 0 && !error && ( // Show loader if still loading and no data/error yet
        <div className="flex flex-col items-center justify-center text-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading your bookings...</p>
        </div>
      )}

      {!isLoadingBookings && bookings.length === 0 && !error && (
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
              key={booking.bookingId} // Ensure PassengerBooking has a unique bookingId
              booking={booking}
              onCancelBooking={handleCancelBooking}
              isCancelling={cancellingBookingId === booking.bookingId}
            />
          ))}
        </div>
      )}
       {/* Display general error here if bookings are already shown but a subsequent load failed */}
       {error && bookings.length > 0 && (
        <div className="mt-6 p-4 border border-destructive/50 bg-destructive/10 rounded-md text-destructive">
          <p><strong>Note:</strong> There was an issue refreshing some data: {error}</p>
          <p>The displayed bookings might not be fully up-to-date or complete.</p>
        </div>
      )}
    </div>
  );
}