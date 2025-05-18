// frontend/app/(root)/driver/my-rides/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { DriverOfferedRide, BookingDTO } from '@/types'; // Ensure BookingDTO is imported
import DriverRideCard from '@/components/driver/DriverRideCard';
import { toast } from 'react-toastify';
import { Loader2, Car, Frown, Inbox, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Fetch Driver's Offered Rides (already seems okay, assuming backend /api/driver/my-rides returns DriverOfferedRide compatible array)
const fetchDriverOfferedRidesApi = async (token: string | null): Promise<DriverOfferedRide[]> => {
  if (!token) throw new Error("Authentication token is missing.");
  const url = `${API_BASE_URL}/api/driver/my-rides`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (response.status === 204) { // No content means empty list
    return [];
  }
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
    throw new Error(errorBody.message || `Failed to fetch offered rides.`);
  }
  const responseBody = await response.json();
  if (!Array.isArray(responseBody)) {
    throw new Error("Invalid data format: Expected an array of rides.");
  }
  return responseBody as DriverOfferedRide[];
};


// --- Ride Lifecycle API Calls ---

// API call to START a ride
const startRideApi = async (rideId: string, token: string | null): Promise<DriverOfferedRide> => {
  if (!token) throw new Error("Authentication required to start ride.");
  const url = `${API_BASE_URL}/api/rides/${rideId}/start`; // From RideController
  console.log(`API CALL: Starting ride ${rideId} at ${url}`);

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json', // Though no body, standard for PUT
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to start ride. Server responded with ${response.status}` }));
    throw new Error(errorData.message || `Failed to start ride.`);
  }
  return response.json(); // Expects updated RideDTO (compatible with DriverOfferedRide)
};

// API call to COMPLETE a ride
const completeRideApi = async (rideId: string, token: string | null): Promise<DriverOfferedRide> => {
  if (!token) throw new Error("Authentication required to complete ride.");
  const url = `${API_BASE_URL}/api/rides/${rideId}/complete`; // From RideController
  console.log(`API CALL: Completing ride ${rideId} at ${url}`);

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to complete ride. Server responded with ${response.status}` }));
    throw new Error(errorData.message || `Failed to complete ride.`);
  }
  return response.json(); // Expects updated RideDTO
};

// API call to set ride status to CANCELLED_BY_DRIVER (via PUT /api/rides/{rideId}/cancel)
const setRideStatusCancelledApi = async (rideId: string, token: string | null): Promise<void> => {
    if (!token) throw new Error("Authentication required to cancel ride status.");
    const url = `${API_BASE_URL}/api/rides/${rideId}/cancel`; // From RideController
    console.log(`API CALL: Setting ride ${rideId} status to cancelled at ${url}`);

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) { // Includes 204 No Content as !ok if not handled
        if (response.status === 204) {
            // Success, but no content to parse
            return;
        }
        const errorData = await response.json().catch(() => ({ message: `Failed to set ride status to cancelled. Server responded with ${response.status}` }));
        throw new Error(errorData.message || `Failed to set ride status to cancelled.`);
    }
    // If it's 200 OK for some reason, check. But typically 204.
    if (response.status === 204) {
        return; // Explicitly return void for 204
    }
    // If backend unexpectedly returns content with 200 on this call, it would be handled here.
    // For now, assume 204 is the primary success path.
};


// --- Booking Management API Calls ---
const confirmBookingApi = async (bookingId: string, token: string | null): Promise<BookingDTO> => {
    if (!token) throw new Error("Authentication required to confirm booking.");
    const url = `${API_BASE_URL}/api/driver/bookings/${bookingId}/confirm`; // From DriverController
    console.log(`API CALL: Confirming booking ${bookingId} at ${url}`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to confirm booking. Server responded with ${response.status}` }));
        throw new Error(errorData.message || `Failed to confirm booking.`);
    }
    return response.json(); // Expects BookingDTO
};

const rejectBookingApi = async (bookingId: string, token: string | null): Promise<BookingDTO> => {
    if (!token) throw new Error("Authentication required to reject booking.");
    const url = `${API_BASE_URL}/api/driver/bookings/${bookingId}/reject`; // From DriverController
    console.log(`API CALL: Rejecting booking ${bookingId} at ${url}`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to reject booking. Server responded with ${response.status}` }));
        throw new Error(errorData.message || `Failed to reject booking.`);
    }
    return response.json(); // Expects BookingDTO
};


export default function MyOfferedRidesPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [offeredRides, setOfferedRides] = useState<DriverOfferedRide[]>([]);
  const [isLoadingRides, setIsLoadingRides] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadOfferedRides = useCallback(async () => {
    if (!token || !user?.roles.includes("DRIVER")) {
      setIsLoadingRides(false);
      return;
    }
    setIsLoadingRides(true);
    setError(null);
    try {
      const ridesArray = await fetchDriverOfferedRidesApi(token);
      setOfferedRides(ridesArray);
      setTotalElements(ridesArray.length);
      setTotalPages(ridesArray.length > 0 ? 1 : 0);
      setCurrentPage(0);
    } catch (err: any) {
      console.error("Failed to load offered rides:", err);
      setError(err.message || "Could not load your offered rides.");
      toast.error(err.message || "Failed to load offered rides.");
      setOfferedRides([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setIsLoadingRides(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (authLoading) {
      setIsLoadingRides(true);
      return;
    }
    if (user && user.roles.includes("DRIVER")) {
      loadOfferedRides();
    } else {
      setIsLoadingRides(false);
    }
  }, [authLoading, user, loadOfferedRides]);

  const handleRideLifecycleAction = async (rideId: string, action: 'START' | 'COMPLETE' | 'CANCEL_STATUS') => {
    try {
      if (action === 'START') {
        await startRideApi(rideId, token);
        toast.success(`Ride successfully started!`);
      } else if (action === 'COMPLETE') {
        await completeRideApi(rideId, token);
        toast.success(`Ride successfully completed!`);
      } else if (action === 'CANCEL_STATUS') {
        await setRideStatusCancelledApi(rideId, token);
        toast.success(`Ride status updated to cancelled.`);
      } else {
        console.error("Unknown lifecycle action:", action);
        toast.error("Unknown ride action.");
        return;
      }
      loadOfferedRides(); // Refresh list
    } catch (error: any) {
      toast.error(error.message || `Failed to perform action: ${action.toLowerCase()}.`);
    }
  };
  
  const handleRideDeleted = (rideId: string) => {
    // The toast for deletion success/failure is handled in DriverRideCard's handleTrueCancelRide.
    // This callback refreshes the list.
    console.log(`Ride ${rideId} was deleted/cancelled, refreshing list.`);
    loadOfferedRides();
  };

  const handleConfirmBooking = async (rideId: string, bookingId: string) => { // rideId might not be needed here if bookingId is globally unique
    try {
        await confirmBookingApi(bookingId, token); // Use new API function
        toast.success(`Booking ${bookingId} confirmed.`);
        loadOfferedRides();
    } catch (error: any) {
        toast.error(error.message || "Failed to confirm booking.");
    }
  };

  const handleRejectBooking = async (rideId: string, bookingId: string) => { // rideId might not be needed here
     try {
        await rejectBookingApi(bookingId, token); // Use new API function
        toast.success(`Booking ${bookingId} rejected.`);
        loadOfferedRides();
    } catch (error: any) {
        toast.error(error.message || "Failed to reject booking.");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  // --- RENDER LOGIC (no changes here, keeping it concise) ---
  if (authLoading) {
    return <div className="flex flex-grow items-center justify-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  if (!user) {
    return ( <div className="flex flex-col flex-grow items-center justify-center p-6 text-center h-screen"> <Frown className="h-16 w-16 text-destructive mb-4" /> <h2 className="text-2xl font-semibold text-destructive mb-2">Not Authenticated</h2> <p className="text-muted-foreground max-w-md">Please log in to view this page.</p><Button onClick={() => router.push('/login?redirect=/driver/my-rides')} className="mt-4">Login</Button> </div> );
  }
  if (!user.roles.includes("DRIVER")) {
    return ( <div className="flex flex-col flex-grow items-center justify-center p-6 text-center h-screen"> <Frown className="h-16 w-16 text-destructive mb-4" /> <h2 className="text-2xl font-semibold text-destructive mb-2">Access Denied</h2> <p className="text-muted-foreground max-w-md">This page is for drivers only.</p><Button onClick={() => router.push('/')} className="mt-4">Go to Dashboard</Button></div> );
  }
  
  if (isLoadingRides && offeredRides.length === 0) {
    return (
        <div className="flex flex-col flex-grow p-4 md:p-6 lg:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white flex items-center">
                  <Car className="mr-3 h-8 w-8 text-green-600" /> My Offered Rides
                  </h1>
                  <p className="text-lg text-muted-foreground dark:text-gray-400 mt-1">
                  View, manage, and track all the rides you've offered.
                  </p>
              </div>
              <Link href="/driver/offer-ride" passHref legacyBehavior>
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white self-start sm:self-center">
                      <PlusCircle className="mr-2 h-5 w-5"/> Offer New Ride
                  </Button>
              </Link>
            </div>
            <Separator/>
            <div className="flex flex-grow items-center justify-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        </div>
    );
  }

  if (error && !isLoadingRides) {
    return ( <div className="flex flex-col flex-grow items-center justify-center p-6 text-center h-screen"> <Frown className="h-16 w-16 text-destructive mb-4" /> <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Rides</h2> <p className="text-muted-foreground max-w-md mb-6">{error}</p> <Button onClick={() => loadOfferedRides()} variant="outline">Try Again</Button> </div> );
  }

  return (
    <div className="flex flex-col flex-grow p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white flex items-center">
            <Car className="mr-3 h-8 w-8 text-green-600" /> My Offered Rides
            </h1>
            <p className="text-lg text-muted-foreground dark:text-gray-400 mt-1">
            View, manage, and track all the rides you've offered.
            </p>
        </div>
        <Link href="/driver/offer-ride" passHref legacyBehavior>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white self-start sm:self-center">
                <PlusCircle className="mr-2 h-5 w-5"/> Offer New Ride
            </Button>
        </Link>
      </div>
      <Separator />

      {isLoadingRides && offeredRides.length > 0 && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 p-2 bg-background/80 backdrop-blur-sm z-50 flex items-center rounded-md shadow-lg">
             <Loader2 className="h-6 w-6 animate-spin text-primary" /> <span className="ml-2 text-sm">Refreshing rides...</span>
          </div>
      )}

      {!isLoadingRides && totalElements === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
          <Inbox className="h-20 w-20 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">No Rides Offered Yet</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            You haven't offered any rides. Click the button above to create your first ride offer!
          </p>
        </div>
      )}

      {offeredRides && offeredRides.length > 0 && (
        <div className="space-y-6">
          {offeredRides.map((ride) => (
            <DriverRideCard
              key={ride.id}
              ride={ride}
              onUpdateRideLifecycleStatus={handleRideLifecycleAction}
              onConfirmBooking={handleConfirmBooking}
              onRejectBooking={handleRejectBooking}
              onRideDeleted={handleRideDeleted}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && !isLoadingRides && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : undefined}
                  aria-disabled={currentPage === 0}
                />
              </PaginationItem>
              {[...Array(totalPages).keys()].map(pageNumber => (
                 (pageNumber === 0 || pageNumber === totalPages - 1 || Math.abs(pageNumber - currentPage) <= 1 || (currentPage <=2 && pageNumber <=3) || (currentPage >= totalPages -3 && pageNumber >= totalPages -4) ) ? (
                    <PaginationItem key={pageNumber}>
                    <PaginationLink
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePageChange(pageNumber); }}
                        isActive={currentPage === pageNumber}
                        aria-current={currentPage === pageNumber ? "page" : undefined}
                    >
                        {pageNumber + 1}
                    </PaginationLink>
                    </PaginationItem>
                ) : ( (Math.abs(pageNumber - currentPage) === 2 && totalPages > 5 && !((currentPage <=2 && pageNumber <=3) || (currentPage >= totalPages -3 && pageNumber >= totalPages -4))) || (pageNumber === 1 && currentPage > 3 && totalPages > 5) || (pageNumber === totalPages -2 && currentPage < totalPages-4 && totalPages > 5)  )  ? (
                    <PaginationItem key={`ellipsis-${pageNumber}`} aria-hidden="true">
                        <PaginationEllipsis />
                    </PaginationItem>
                ) : null
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                  className={currentPage >= totalPages - 1 ? "pointer-events-none opacity-50" : undefined}
                  aria-disabled={currentPage >= totalPages - 1}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
       {!isLoadingRides && totalElements > 0 && <p className="text-center text-sm text-muted-foreground mt-2">Showing {offeredRides.length} of {totalElements} offered rides.</p>}
    </div>
  );
}