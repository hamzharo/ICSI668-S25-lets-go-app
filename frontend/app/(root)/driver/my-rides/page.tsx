// frontend/app/(root)/driver/my-rides/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { DriverOfferedRide } from '@/types'; // Ensure this is the correct type
import DriverRideCard from '@/components/driver/DriverRideCard';
import { toast } from 'react-toastify';
import { Loader2, Car, Frown, Inbox, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"; // Import ShadCN Pagination

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface PaginatedDriverRidesResponse { // Define the expected paginated response
    content: DriverOfferedRide[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
    size: number;
}

// --- TODO: Update this API call to support pagination and return the PaginatedDriverRidesResponse structure ---
const fetchDriverOfferedRidesApi = async (
    page: number, // 0-indexed
    size: number,
    token: string | null
): Promise<PaginatedDriverRidesResponse> => {
  if (!token) throw new Error("Authentication required.");

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: 'departureTime,desc', // Example sorting: newest departure first for active, or by creation date
  });

  const url = `${API_BASE_URL}/api/driver/rides/my-offered-rides?${queryParams.toString()}`; // Adjust endpoint
  console.log(`API CALL: Fetching driver's offered rides (paginated): ${url}`);

  // const response = await fetch(url, {
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // if (!response.ok) {
  //   const errorResult = await response.json().catch(() => ({ message: "Failed to fetch offered rides." }));
  //   throw new Error(errorResult.message);
  // }
  // return response.json(); // EXPECTS PaginatedDriverRidesResponse

  // Mock API response with pagination:
  return new Promise(resolve => setTimeout(() => {
    const allMockRides: DriverOfferedRide[] = [ // Populate with more diverse mock data (15-20 items)
        { id: 'dr_1', departureCity: 'City A', destinationCity: 'City B', departureTime: new Date(Date.now() + 86400000 * 1).toISOString(), estimatedArrivalTime: new Date(Date.now() + 86400000 * 1 + 3600000).toISOString(), availableSeats: 2, totalSeats: 3, pricePerSeat: 15, vehicleDescription: "Civic", status: 'SCHEDULED', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), bookingRequests: [{ bookingId: 'br_1a', passengerId: 'p1', passengerFirstName: ' PassengerX', seatsRequested: 1, requestTime: new Date().toISOString(), status: 'REQUESTED' }], confirmedBookingsCount: 1 },
        { id: 'dr_2', departureCity: 'City C', destinationCity: 'City D', departureTime: new Date(Date.now() + 86400000 * 2).toISOString(), estimatedArrivalTime: new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(), availableSeats: 3, totalSeats: 4, pricePerSeat: 20, vehicleDescription: "RAV4", status: 'SCHEDULED', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), bookingRequests: [], confirmedBookingsCount: 1 },
        { id: 'dr_3', departureCity: 'City E', destinationCity: 'City F', departureTime: new Date(Date.now() - 86400000 * 3).toISOString(), estimatedArrivalTime: new Date(Date.now() - 86400000 * 3 + 3600000).toISOString(), availableSeats: 0, totalSeats: 2, pricePerSeat: 10, status: 'COMPLETED', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), confirmedBookingsCount: 2 },
        // ... Add more mock rides to exceed 'size' for pagination testing ...
        { id: 'dr_4', departureCity: 'City G', destinationCity: 'City H', departureTime: new Date(Date.now() + 86400000 * 4).toISOString(), estimatedArrivalTime: new Date(Date.now() + 86400000 * 4 + 3600000).toISOString(), availableSeats: 1, totalSeats: 2, pricePerSeat: 12, vehicleDescription: "Accord", status: 'SCHEDULED', createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(), bookingRequests: [], confirmedBookingsCount: 1 },
        { id: 'dr_5', departureCity: 'City I', destinationCity: 'City J', departureTime: new Date(Date.now() - 86400000 * 10).toISOString(), estimatedArrivalTime: new Date(Date.now() - 86400000 * 10 + 3600000).toISOString(), availableSeats: 0, totalSeats: 3, pricePerSeat: 18, status: 'CANCELLED_BY_DRIVER', createdAt: new Date(Date.now() - 86400000 * 12).toISOString(), confirmedBookingsCount: 0 },
    ]; // Ensure you have enough items to test pagination (e.g., > size)

    // Sorting logic (example: active rides first, then by departure time)
    allMockRides.sort((a, b) => {
        const activeStatuses: DriverOfferedRide['status'][] = ['SCHEDULED', 'IN_PROGRESS'];
        const aIsActive = activeStatuses.includes(a.status);
        const bIsActive = activeStatuses.includes(b.status);
        if (aIsActive && !bIsActive) return -1;
        if (!aIsActive && bIsActive) return 1;
        if (aIsActive && bIsActive) return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
        return new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime();
    });

    const totalElements = allMockRides.length;
    const totalPages = Math.ceil(totalElements / size);
    const startIndex = page * size;
    const content = allMockRides.slice(startIndex, startIndex + size);

    resolve({
      content,
      totalPages,
      totalElements,
      currentPage: page,
      size,
    });
  }, 1000));
};

// --- (Keep manageBookingRequestApi and other API helpers from the original MyOfferedRidesPage) ---
// For brevity, I'll assume these are present: updateRideStatusApi, manageBookingRequestApi
const updateRideStatusApi = async (rideId: string, newStatus: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED_BY_DRIVER', token: string | null): Promise<DriverOfferedRide> => { /* ... */ return new Promise(res => res({} as DriverOfferedRide)) };
const manageBookingRequestApi = async (bookingId: string, action: 'confirm' | 'reject', token: string | null): Promise<{ message: string }> => { /* ... */ return new Promise(res => res({message: ""})) };
// --- End API Helpers ---


export default function MyOfferedRidesPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [offeredRides, setOfferedRides] = useState<DriverOfferedRide[]>([]);
  const [isLoadingRides, setIsLoadingRides] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed for API
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 5; // Or make this configurable

  const loadOfferedRides = useCallback(async (pageToLoad: number) => {
    if (!token || user?.role !== 'DRIVER') {
      if(!authLoading) setIsLoadingRides(false);
      return;
    }
    setIsLoadingRides(true);
    setError(null);
    try {
      const response = await fetchDriverOfferedRidesApi(pageToLoad, itemsPerPage, token);
      setOfferedRides(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage); // API returns 0-indexed current page
      setTotalElements(response.totalElements);
    } catch (err: any)      {
      console.error("Failed to load offered rides:", err);
      setError(err.message || "Could not load your offered rides.");
      toast.error(err.message || "Failed to load offered rides.");
    } finally {
      setIsLoadingRides(false);
    }
  }, [token, user, authLoading, itemsPerPage]); // Removed itemsPerPage if it's constant

  useEffect(() => {
    if (!authLoading && user?.role === 'DRIVER') {
        loadOfferedRides(currentPage); // Load current page when component mounts or currentPage changes
    } else if (!authLoading && user?.role !== 'DRIVER') {
        toast.error("Access denied. This page is for drivers only.");
        router.replace("/");
        setIsLoadingRides(false);
    }
  }, [authLoading, user, loadOfferedRides, router, currentPage]); // Add currentPage to dependencies

  const handleUpdateRideStatus = async (rideId: string, newStatus: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED_BY_DRIVER') => {
    try {
        await updateRideStatusApi(rideId, newStatus, token);
        // Instead of full reload, ideally update only the affected ride in the list or fetch current page again
        loadOfferedRides(currentPage);
    } catch (error: any) {
        toast.error(error.message || `Failed to update ride to ${newStatus}`);
    }
  };

  const handleConfirmBooking = async (rideId: string, bookingId: string) => {
    try {
        await manageBookingRequestApi(bookingId, 'confirm', token);
        loadOfferedRides(currentPage); // Refresh current page data
    } catch (error: any) {
        toast.error(error.message || "Failed to confirm booking.");
    }
  };

  const handleRejectBooking = async (rideId: string, bookingId: string) => {
     try {
        await manageBookingRequestApi(bookingId, 'reject', token);
        loadOfferedRides(currentPage); // Refresh current page data
    } catch (error: any) {
        toast.error(error.message || "Failed to reject booking.");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      // `currentPage` state update will trigger `useEffect` to call `loadOfferedRides`
      setCurrentPage(newPage);
    }
  };

  // ... (Keep existing loading, error, and access denied JSX from original MyOfferedRidesPage) ...
  if (authLoading || (!user && isLoadingRides && offeredRides.length === 0)) {
    return <div className="flex flex-grow items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  if (!user || user.role !== 'DRIVER') {
    return ( <div className="flex flex-col flex-grow items-center justify-center p-6 text-center"> <Frown className="h-16 w-16 text-destructive mb-4" /> <h2 className="text-2xl font-semibold text-destructive mb-2">Access Denied</h2> <p className="text-muted-foreground max-w-md">This page is for drivers only.</p> </div> );
  }
  if (error && !isLoadingRides) {
    return ( <div className="flex flex-col flex-grow items-center justify-center p-6 text-center"> <Frown className="h-16 w-16 text-destructive mb-4" /> <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Rides</h2> <p className="text-muted-foreground max-w-md mb-6">{error}</p> <Button onClick={() => loadOfferedRides(currentPage)} variant="outline">Try Again</Button> </div> );
  }

  return (
    <div className="flex flex-col flex-grow p-4 md:p-6 lg:p-8 space-y-8">
      {/* ... (Header section with "Offer New Ride" button - keep as is) ... */}
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

      {isLoadingRides && offeredRides.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Loading your offered rides...</p>
          </div>
      )}

      {!isLoadingRides && totalElements === 0 && ( // Check totalElements for true empty state
        <div className="flex flex-col items-center justify-center text-center py-16 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
          <Inbox className="h-20 w-20 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">No Rides Offered Yet</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            You haven't offered any rides. Click the button above to create your first ride offer!
          </p>
        </div>
      )}

      {offeredRides.length > 0 && (
        <div className="space-y-6">
          {offeredRides.map((ride) => (
            <DriverRideCard
              key={ride.id}
              ride={ride}
              onUpdateStatus={handleUpdateRideStatus} // Pass the new handler
              onConfirmBooking={handleConfirmBooking} // Pass the new handler
              onRejectBooking={handleRejectBooking}   // Pass the new handler
            />
          ))}
        </div>
      )}

      {/* Pagination Controls - Render if totalPages > 1 */}
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
              {/* Generate Page Numbers (simplified example) */}
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
                  className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : undefined}
                  aria-disabled={currentPage === totalPages - 1}
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