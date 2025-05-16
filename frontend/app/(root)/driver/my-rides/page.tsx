// frontend/app/(root)/driver/my-rides/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { DriverOfferedRide } from '@/types';
import DriverRideCard from '@/components/driver/DriverRideCard';
import { toast } from 'react-toastify';
import { Loader2, Car, Frown, Inbox, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// This interface is now effectively unused if backend doesn't paginate,
// but kept for potential future backend upgrade.
// interface PaginatedDriverRidesResponse {
//     content: DriverOfferedRide[];
//     totalPages: number;
//     totalElements: number;
//     number: number;
//     size: number;
// }
 
// Updated API call: Expects a simple array if backend doesn't paginate.
const fetchDriverOfferedRidesApi = async (
    token: string | null
): Promise<DriverOfferedRide[]> => { // Returns DriverOfferedRide[] directly
  if (!token) {
    console.error("API CALL ERROR: No authentication token provided.");
    throw new Error("Authentication token is missing. Please log in again.");
  }

  // Endpoint as per your Postman, assuming no pagination query params are supported by it
  const url = `${API_BASE_URL}/api/driver/my-rides`;
  console.log(`API CALL: Fetching driver's offered rides: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        // 'Content-Type': 'application/json', // Not strictly needed for GET but good practice
      },
    });

    // Try to parse JSON regardless of content-type for flexibility, but check response.ok first
    if (!response.ok) {
        let errorBody;
        try {
            errorBody = await response.json();
            const errorMessage = errorBody?.message || errorBody?.error || `Failed to fetch offered rides. Server responded with ${response.status}.`;
            console.error("API Error (JSON):", errorMessage, errorBody);
            throw new Error(errorMessage);
        } catch (e) {
            // If parsing error body as JSON fails, read as text
            const textError = await response.text();
            console.error("API Error (Non-JSON):", textError, response.status);
            throw new Error(textError || `Failed to fetch offered rides. Server responded with ${response.status}.`);
        }
    }
    
    const responseBody = await response.json();
    console.log("API Response Body (expected array):", responseBody);


    // Backend returns a direct array of rides
    if (!Array.isArray(responseBody)) {
        console.error("API Error: Expected an array of rides, but received:", responseBody);
        throw new Error("Invalid data format received from server. Expected an array.");
    }
    return responseBody as DriverOfferedRide[];

  } catch (error: any) {
    console.error("Error during fetchDriverOfferedRidesApi call:", error);
    if (error instanceof Error) {
        throw error;
    } else {
        throw new Error(String(error.message || "An unknown error occurred while fetching rides."));
    }
  }
};

// --- Dummy API Helpers (Keep as is) ---
const updateRideStatusApi = async (rideId: string, newStatus: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED_BY_DRIVER', token: string | null): Promise<DriverOfferedRide> => {
    console.warn("updateRideStatusApi is a STUB");
    return new Promise(resolve => setTimeout(() => {
        toast.info(`Mock: Ride ${rideId} status updated to ${newStatus}`);
        resolve({ id: rideId, status: newStatus } as unknown as DriverOfferedRide);
    }, 500));
};
const manageBookingRequestApi = async (bookingId: string, action: 'confirm' | 'reject', token: string | null): Promise<{ message: string }> => {
    console.warn("manageBookingRequestApi is a STUB");
    return new Promise(resolve => setTimeout(() => {
        const message = `Mock: Booking ${bookingId} ${action}ed.`;
        toast.info(message);
        resolve({ message });
    }, 500));
};
// --- End API Helpers ---


export default function MyOfferedRidesPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [offeredRides, setOfferedRides] = useState<DriverOfferedRide[]>([]); // Initialized as empty array
  const [isLoadingRides, setIsLoadingRides] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State (will be minimal if backend doesn't paginate)
  const [currentPage, setCurrentPage] = useState(0); // Will likely stay 0
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  // const itemsPerPage = 5; // Not used if no client-side pagination is implemented

  const loadOfferedRides = useCallback(async () => {
    if (!token || !user?.roles.includes("DRIVER")) {
      setIsLoadingRides(false);
      return;
    }
    console.log(`loadOfferedRides called`);
    setIsLoadingRides(true);
    setError(null);
    try {
      const ridesArray = await fetchDriverOfferedRidesApi(token); // Call updated API function
      setOfferedRides(ridesArray); // Set the fetched array directly

      // Update pagination state based on the single array fetched
      setTotalElements(ridesArray.length);
      setTotalPages(ridesArray.length > 0 ? 1 : 0); // Only 1 "page"
      setCurrentPage(0); // Always on the first (and only) "page"

    } catch (err: any)      {
      console.error("Failed to load offered rides:", err);
      setError(err.message || "Could not load your offered rides.");
      toast.error(err.message || "Failed to load offered rides.");
      setOfferedRides([]); // CRITICAL: Ensure offeredRides is an empty array on error
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
      loadOfferedRides(); // Call without page argument
    } else { // Handles: user but not DRIVER, or no user
      setIsLoadingRides(false);
    }
  }, [authLoading, user, loadOfferedRides]);


  const handleUpdateRideStatus = async (rideId: string, newStatus: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED_BY_DRIVER') => {
    // setIsLoadingRides(true); // Optional: show a loading indicator for the action
    try {
        await updateRideStatusApi(rideId, newStatus, token);
        toast.success(`Ride status updated to ${newStatus}.`);
        loadOfferedRides(); // Refresh all rides
    } catch (error: any) {
        toast.error(error.message || `Failed to update ride to ${newStatus}`);
        // setIsLoadingRides(false);
    }
  };

  const handleConfirmBooking = async (rideId: string, bookingId: string) => {
    // setIsLoadingRides(true); // Optional
    try {
        await manageBookingRequestApi(bookingId, 'confirm', token);
        toast.success(`Booking ${bookingId} confirmed.`);
        loadOfferedRides();
    } catch (error: any) {
        toast.error(error.message || "Failed to confirm booking.");
        // setIsLoadingRides(false);
    }
  };

  const handleRejectBooking = async (rideId: string, bookingId: string) => {
    // setIsLoadingRides(true); // Optional
     try {
        await manageBookingRequestApi(bookingId, 'reject', token);
        toast.success(`Booking ${bookingId} rejected.`);
        loadOfferedRides();
    } catch (error: any) {
        toast.error(error.message || "Failed to reject booking.");
        // setIsLoadingRides(false);
    }
  };

  // This handler is now mostly for future use if backend pagination is added.
  // With current setup (totalPages <= 1), it won't be effectively used.
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      // If you implement client-side pagination in the future, you'd handle it here.
      // For now, loadOfferedRides fetches everything, so changing page doesn't re-fetch differently.
    }
  };

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

      {/* This condition offeredRides && offeredRides.length > 0 is now safe */}
      {offeredRides && offeredRides.length > 0 && (
        <div className="space-y-6">
          {offeredRides.map((ride) => (
            <DriverRideCard
              key={ride.id}
              ride={ride}
              onUpdateStatus={handleUpdateRideStatus}
              onConfirmBooking={handleConfirmBooking}
              onRejectBooking={handleRejectBooking}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls - Will not render if totalPages <= 1 */}
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
