// // frontend/app/(root)/search-rides/page.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import RideSearchForm from '@/components/rides/RideSearchForm';
// import RideCard from '@/components/rides/RideCard'; // Ensure this component exists and is correctly imported
// import { RideSearchResult, RideSearchFormValues } from '@/types'; // Ensure types are correctly defined and imported
// import { useAuth } from '@/lib/AuthContext'; // Your authentication context
// import { toast } from 'react-toastify'; // For user notifications
// import { Loader2, SearchX, Frown } from 'lucide-react'; // Icons
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Your UI components
// import { Separator } from '@/components/ui/separator'; // Your UI components

// // API function to search for rides
// const searchRidesApi = async (params: RideSearchFormValues, token: string | null): Promise<RideSearchResult[]> => {
//   console.log("[searchRidesApi] Received search params:", params);

//   // Example: Make auth optional for search via an environment variable
//   // const requireAuth = process.env.NEXT_PUBLIC_REQUIRE_AUTH_FOR_SEARCH === 'true';
//   // if (requireAuth && !token) {
//   //   console.error("[searchRidesApi] Authentication token is required but not provided.");
//   //   throw new Error("Authentication required to search rides.");
//   // }

//   const baseUrl = process.env.NEXT_PUBLIC_API_URL;
//   if (!baseUrl) {
//     console.error("[searchRidesApi] NEXT_PUBLIC_API_URL is not defined.");
//     throw new Error("API configuration error. Base URL is missing.");
//   }

//   const queryParams = new URLSearchParams();
//   queryParams.append('departureCity', params.departureCity);
//   queryParams.append('departureState', params.departureState);
//   queryParams.append('destinationCity', params.destinationCity);
//   queryParams.append('destinationState', params.destinationState);

//   if (params.earliestDepartureTime) {
//     try {
//       // Ensure the date string from <input type="datetime-local"> is converted to full ISO string
//       const isoTime = new Date(params.earliestDepartureTime).toISOString();
//       queryParams.append('earliestDepartureTime', isoTime);
//       console.log("[searchRidesApi] Appended earliestDepartureTime as ISO:", isoTime);
//     } catch (e) {
//       console.error("[searchRidesApi] Invalid date format for earliestDepartureTime:", params.earliestDepartureTime, e);
//       // Decide if you want to throw an error or let the backend handle it (it will default to LocalDateTime.now())
//       // For now, we'll just log it and the backend will use its default if the param is missing/invalid
//     }
//   } else {
//     console.log("[searchRidesApi] earliestDepartureTime not provided by form, backend will use default.");
//   }

//   const apiUrl = `${baseUrl}/api/rides/search?${queryParams.toString()}`;
//   console.log(`[searchRidesApi] Attempting to fetch: GET ${apiUrl}`);

//   const headers: HeadersInit = {
//     'Accept': 'application/json', // Important: Tell the server we expect JSON
//     // 'Content-Type': 'application/json', // Not strictly needed for GET requests without a body
//   };
//   if (token) {
//     headers['Authorization'] = `Bearer ${token}`;
//     console.log("[searchRidesApi] Authorization header added.");
//   } else {
//     console.log("[searchRidesApi] No token provided, request will be unauthenticated (if allowed by backend).");
//   }

//   const response = await fetch(apiUrl, {
//     method: 'GET',
//     headers: headers,
//   });

//   console.log(`[searchRidesApi] Response Status: ${response.status}`);

//   if (response.status === 204) { // No Content
//     console.log("[searchRidesApi] Received 204 No Content: No rides found.");
//     return [];
//   }

//   // Try to get response text for better debugging, especially for non-JSON error responses
//   const responseText = await response.text(); // Get raw response text first

//   if (!response.ok) {
//     let errorMsg = `API Error (${response.status}): ${response.statusText || 'Failed to fetch rides.'}`;
//     let errorDetails = null;
//     try {
//       errorDetails = JSON.parse(responseText); // Try to parse as JSON
//       // Adjust to your backend's error DTO structure
//       errorMsg = errorDetails.message || errorDetails.error || errorDetails.title || errorMsg;
//       console.error("[searchRidesApi] Parsed API Error Details:", errorDetails);
//     } catch (e) {
//       console.error("[searchRidesApi] Failed to parse error response as JSON. Raw text:", responseText);
//       // If not JSON, use the raw text if it's informative, or stick to status text
//       if(responseText && responseText.length < 500) { // Avoid logging huge HTML error pages
//         errorMsg = `${errorMsg} - ${responseText}`;
//       }
//     }
//     console.error("[searchRidesApi] Full error message to be thrown:", errorMsg);
//     throw new Error(errorMsg);
//   }

//   try {
//     const results = JSON.parse(responseText); // Now parse the successful response text
//     console.log("[searchRidesApi] Successfully fetched and parsed rides:", results);
//     return results as RideSearchResult[];
//   } catch (e) {
//     console.error("[searchRidesApi] Failed to parse successful response as JSON. Raw text:", responseText, e);
//     throw new Error("Received malformed data from the server.");
//   }
// };

// export default function SearchRidesPage() {
//   const { token, isLoading: authLoading, user } = useAuth();
//   const [searchResults, setSearchResults] = useState<RideSearchResult[]>([]);
//   const [isLoadingSearch, setIsLoadingSearch] = useState(false);
//   const [searchAttempted, setSearchAttempted] = useState(false);
//   const [searchError, setSearchError] = useState<string | null>(null);

//   // Effect to clear results/error if user logs out or auth state changes
//   useEffect(() => {
//     if (!user && !authLoading) { // Check authLoading to prevent premature clearing
//       console.log("[SearchRidesPage] User logged out or auth state changed, clearing search results.");
//       setSearchResults([]);
//       setSearchAttempted(false);
//       setSearchError(null);
//     }
//   }, [user, authLoading]);

//   const handleSearch = async (searchParams: RideSearchFormValues) => {
//     console.log("[handleSearch] Initiating search with form params:", searchParams);

//     // Check if authentication is still loading, might be too early to check token
//     if (authLoading) {
//       toast.info("Authenticating... please wait before searching.");
//       console.log("[handleSearch] Authentication still loading, search deferred.");
//       return;
//     }

//     // Example: Make auth optional via environment variable
//     // const requireAuth = process.env.NEXT_PUBLIC_REQUIRE_AUTH_FOR_SEARCH === 'true';
//     // if (requireAuth && !token) {
//     //   toast.error("Please log in to search for rides.");
//     //   console.log("[handleSearch] User not logged in, but authentication is required for search.");
//     //   return;
//     // }

//     setIsLoadingSearch(true);
//     setSearchAttempted(true);
//     setSearchError(null);
//     setSearchResults([]); // Clear previous results immediately

//     try {
//       const results = await searchRidesApi(searchParams, token);
//       setSearchResults(results);
//       if (results.length === 0 && searchAttempted) { // Ensure search was actually attempted
//         toast.info("No rides found matching your criteria.");
//       } else if (results.length > 0) {
//         toast.success(`Found ${results.length} ride(s).`);
//       }
//     } catch (error: any) {
//       console.error("[handleSearch] Search failed:", error);
//       const errorMessage = error.message || "An unexpected error occurred. Please try again.";
//       setSearchError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setIsLoadingSearch(false);
//       console.log("[handleSearch] Search process finished.");
//     }
//   };

//   // Initial loading state for the page, primarily for auth
//   if (authLoading) {
//     console.log("[SearchRidesPage] Auth is loading, showing page loader.");
//     return (
//       <div className="flex flex-grow items-center justify-center h-screen">
//         <Loader2 className="h-12 w-12 animate-spin text-primary" />
//         <p className="ml-4 text-lg">Loading authentication...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col flex-grow p-4 md:p-6 lg:p-8 space-y-8">
//       <header className="mb-2">
//         <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
//           Find Your Next Journey
//         </h1>
//         <p className="text-lg text-muted-foreground dark:text-gray-400">
//           Enter your travel details below to discover available rides.
//         </p>
//       </header>

//       <RideSearchForm onSearch={handleSearch} isLoading={isLoadingSearch} />

//       <Separator className="my-6 md:my-8" />

//       {/* Search Results Section */}
//       <section aria-live="polite" className="search-results">
//         {isLoadingSearch && (
//           <div className="flex flex-col items-center justify-center text-center py-10">
//             <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
//             <p className="text-lg text-muted-foreground">Searching for available rides...</p>
//           </div>
//         )}

//         {!isLoadingSearch && searchError && (
//           <Alert variant="destructive" className="max-w-2xl mx-auto">
//             <Frown className="h-5 w-5" />
//             <AlertTitle>Search Error!</AlertTitle>
//             <AlertDescription>
//               {searchError}
//             </AlertDescription>
//           </Alert>
//         )}

//         {!isLoadingSearch && !searchError && searchAttempted && searchResults.length === 0 && (
//           <div className="flex flex-col items-center justify-center text-center py-10 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
//             <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
//             <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Rides Found</h2>
//             <p className="text-muted-foreground max-w-md">
//               We couldn't find any rides matching your current search criteria. Try adjusting your locations or dates.
//             </p>
//           </div>
//         )}

//         {!isLoadingSearch && !searchError && searchResults.length > 0 && (
//           <>
//             <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
//               Available Rides ({searchResults.length})
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {searchResults.map((ride) => (
//                 <RideCard key={ride.id} ride={ride} />
//               ))}
//             </div>
//           </>
//         )}
//       </section>
//     </div>
//   );
// }


// frontend/app/(root)/search-rides/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import RideSearchForm from '@/components/rides/RideSearchForm';
import RideCard from '@/components/rides/RideCard';
import { RideSearchResult, RideSearchFormValues, BookingRequestDTO, BookingDTO } from '@/types'; // Ensure types are correctly defined and imported
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'react-toastify';
import { Loader2, SearchX, Frown, Car, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// API function to search for rides (existing)
const searchRidesApi = async (params: RideSearchFormValues, token: string | null): Promise<RideSearchResult[]> => {
  // ... (your existing searchRidesApi function - no changes needed here for booking)
  // For brevity, I'm omitting the full function, but it remains the same
  console.log("[searchRidesApi] Received search params:", params);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    console.error("[searchRidesApi] NEXT_PUBLIC_API_URL is not defined.");
    throw new Error("API configuration error. Base URL is missing.");
  }

  const queryParams = new URLSearchParams();
  queryParams.append('departureCity', params.departureCity);
  queryParams.append('departureState', params.departureState);
  queryParams.append('destinationCity', params.destinationCity);
  queryParams.append('destinationState', params.destinationState);

  if (params.earliestDepartureTime) {
    try {
      const isoTime = new Date(params.earliestDepartureTime).toISOString();
      queryParams.append('earliestDepartureTime', isoTime);
    } catch (e) {
      console.error("[searchRidesApi] Invalid date format for earliestDepartureTime:", params.earliestDepartureTime, e);
    }
  }

  const apiUrl = `${baseUrl}/api/rides/search?${queryParams.toString()}`;
  const headers: HeadersInit = { 'Accept': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl, { method: 'GET', headers: headers });

  if (response.status === 204) return [];
  const responseText = await response.text();
  if (!response.ok) {
    let errorMsg = `API Error (${response.status}): ${response.statusText || 'Failed to fetch rides.'}`;
    try {
      const errorDetails = JSON.parse(responseText);
      errorMsg = errorDetails.message || errorDetails.error || errorDetails.title || errorMsg;
    } catch (e) { /* Ignore if not JSON */ }
    throw new Error(errorMsg);
  }
  try {
    return JSON.parse(responseText) as RideSearchResult[];
  } catch (e) {
    throw new Error("Received malformed data from the server.");
  }
};


// NEW API function to request a ride
const requestRideApi = async (
  rideId: string,
  bookingData: BookingRequestDTO,
  token: string | null
): Promise<BookingDTO> => {
  console.log(`[requestRideApi] Requesting ride ${rideId} with data:`, bookingData);

  if (!token) {
    console.error("[requestRideApi] Authentication token is required.");
    throw new Error("Authentication required to request a ride.");
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    console.error("[requestRideApi] NEXT_PUBLIC_API_URL is not defined.");
    throw new Error("API configuration error. Base URL is missing.");
  }

  const apiUrl = `${baseUrl}/api/rides/request/${rideId}`;
  console.log(`[requestRideApi] Attempting to POST: ${apiUrl}`);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(bookingData),
  });

  console.log(`[requestRideApi] Response Status: ${response.status}`);
  const responseText = await response.text(); // Get raw response text first

  if (!response.ok) {
    let errorMsg = `API Error (${response.status}): ${response.statusText || 'Failed to request ride.'}`;
    let errorDetails = null;
    try {
      errorDetails = JSON.parse(responseText);
      errorMsg = errorDetails.message || errorDetails.error || errorDetails.title || errorMsg;
      console.error("[requestRideApi] Parsed API Error Details:", errorDetails);
    } catch (e) {
      console.error("[requestRideApi] Failed to parse error response as JSON. Raw text:", responseText);
       if(responseText && responseText.length < 500) {
        errorMsg = `${errorMsg} - ${responseText}`;
      }
    }
    console.error("[requestRideApi] Full error message to be thrown:", errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const result = JSON.parse(responseText);
    console.log("[requestRideApi] Successfully requested ride:", result);
    return result as BookingDTO;
  } catch (e) {
    console.error("[requestRideApi] Failed to parse successful response as JSON. Raw text:", responseText, e);
    throw new Error("Received malformed data from the server after booking.");
  }
};

export default function SearchRidesPage() {
  const { token, isLoading: authLoading, user } = useAuth();
  const [searchResults, setSearchResults] = useState<RideSearchResult[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // State for booking modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRideForBooking, setSelectedRideForBooking] = useState<RideSearchResult | null>(null);
  const [requestedSeats, setRequestedSeats] = useState<number>(1);
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);

  useEffect(() => {
    if (!user && !authLoading) {
      setSearchResults([]);
      setSearchAttempted(false);
      setSearchError(null);
    }
  }, [user, authLoading]);

  const handleSearch = async (searchParams: RideSearchFormValues) => {
    // ... (your existing handleSearch function - no changes needed here for booking)
    // For brevity, I'm omitting the full function, but it remains the same
    console.log("[handleSearch] Initiating search with form params:", searchParams);
    if (authLoading) {
      toast.info("Authenticating... please wait before searching.");
      return;
    }
    setIsLoadingSearch(true);
    setSearchAttempted(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const results = await searchRidesApi(searchParams, token);
      setSearchResults(results);
      if (results.length === 0 && searchAttempted) {
        toast.info("No rides found matching your criteria.");
      } else if (results.length > 0) {
        toast.success(`Found ${results.length} ride(s).`);
      }
    } catch (error: any) {
      const errorMessage = error.message || "An unexpected error occurred. Please try again.";
      setSearchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const handleOpenBookingModal = (rideId: string) => {
    const rideToBook = searchResults.find(r => r.id === rideId);
    if (rideToBook) {
      if (!user || !user.roles?.includes('PASSENGER')) {
          toast.error("Please log in as a passenger to book a ride.");
          return;
      }
      if (rideToBook.availableSeats === 0) {
          toast.warn("This ride has no available seats.");
          return;
      }
      setSelectedRideForBooking(rideToBook);
      setRequestedSeats(1); // Default to 1 seat
      setIsBookingModalOpen(true);
    } else {
      toast.error("Could not find ride details. Please refresh and try again.");
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedRideForBooking || !token || !user?.roles?.includes('PASSENGER')) {
      toast.error("Cannot proceed with booking. Please ensure you are logged in as a passenger.");
      return;
    }

    if (requestedSeats <= 0) {
        toast.error("Please request at least 1 seat.");
        return;
    }
    if (requestedSeats > selectedRideForBooking.availableSeats) {
        toast.error(`Only ${selectedRideForBooking.availableSeats} seats available.`);
        return;
    }

    setIsProcessingBooking(true);
    try {
      const bookingData: BookingRequestDTO = { requestedSeats };
      const bookingResult = await requestRideApi(selectedRideForBooking.id, bookingData, token);
      toast.success(`Ride requested successfully! Booking ID: ${bookingResult.id}. Status: ${bookingResult.status}`);
      setIsBookingModalOpen(false);
      setSelectedRideForBooking(null);
      // Optionally, refresh search results or update the specific ride card's available seats
      // For simplicity, we'll just show a toast. A more complex app might update the UI.
      // Example: Decrement available seats on the client-side for immediate feedback
      setSearchResults(prevResults =>
        prevResults.map(ride =>
          ride.id === selectedRideForBooking.id
            ? { ...ride, availableSeats: ride.availableSeats - requestedSeats }
            : ride
        )
      );

    } catch (error: any) {
      console.error("[handleConfirmBooking] Booking failed:", error);
      const errorMessage = error.message || "An unexpected error occurred during booking.";
      toast.error(errorMessage);
    } finally {
      setIsProcessingBooking(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-grow items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading authentication...</p>
      </div>
    );
  }

  const isPassenger = !!user && user.roles?.includes('PASSENGER');

  return (
    <div className="flex flex-col flex-grow p-4 md:p-6 lg:p-8 space-y-8">
      <header className="mb-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
          Find Your Next Journey
        </h1>
        <p className="text-lg text-muted-foreground dark:text-gray-400">
          Enter your travel details below to discover available rides.
        </p>
      </header>

      <RideSearchForm onSearch={handleSearch} isLoading={isLoadingSearch} />
      <Separator className="my-6 md:my-8" />

      <section aria-live="polite" className="search-results">
        {isLoadingSearch && (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Searching for available rides...</p>
          </div>
        )}

        {!isLoadingSearch && searchError && (
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <Frown className="h-5 w-5" />
            <AlertTitle>Search Error!</AlertTitle>
            <AlertDescription>{searchError}</AlertDescription>
          </Alert>
        )}

        {!isLoadingSearch && !searchError && searchAttempted && searchResults.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-10 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
            <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Rides Found</h2>
            <p className="text-muted-foreground max-w-md">
              We couldn't find any rides matching your current search criteria. Try adjusting your locations or dates.
            </p>
          </div>
        )}

        {!isLoadingSearch && !searchError && searchResults.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              Available Rides ({searchResults.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  onBookRide={handleOpenBookingModal}
                  isPassenger={isPassenger}
                  isBookingRideId={isProcessingBooking && selectedRideForBooking?.id === ride.id ? ride.id : null}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Booking Modal */}
      {selectedRideForBooking && (
        <Dialog open={isBookingModalOpen} onOpenChange={(open) => {
            if (!open) {
                setSelectedRideForBooking(null); // Clear selection when modal closes
            }
            setIsBookingModalOpen(open);
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request Ride</DialogTitle>
              <DialogDescription>
                Request seats for the ride from{' '}
                {/* CORRECTED ACCESS BELOW */}
                <strong>{selectedRideForBooking.departureCity}</strong> to{' '}
                <strong>{selectedRideForBooking.destinationCity}</strong>.
                <br />
                Available seats: {selectedRideForBooking.availableSeats}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="seats" className="text-right col-span-1">
                  Seats
                </Label>
                <Input
                  id="seats"
                  type="number"
                  value={requestedSeats}
                  onChange={(e) => setRequestedSeats(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  min="1"
                  max={selectedRideForBooking.availableSeats} // Ensures user can't request more than available
                  className="col-span-3"
                  disabled={isProcessingBooking}
                />
              </div>
               <p className="text-sm text-muted-foreground col-span-4 text-center">
                {/* Price per seat: ${selectedRideForBooking.pricePerSeat.toFixed(2)} */}
                Price per seat: $${(selectedRideForBooking.pricePerSeat ?? 0).toFixed(2)}
              </p>
              <p className="text-lg font-semibold col-span-4 text-center">
                {/* Total: ${(selectedRideForBooking.pricePerSeat * requestedSeats).toFixed(2)} */}
                Total: $${((selectedRideForBooking.pricePerSeat ?? 0) * requestedSeats).toFixed(2)}
              </p>
            </div>
            The DialogFooter with "Cancel" and "Confirm Request" buttons
                would go here. It was part of the complete example I provided earlier.
                Example:
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBookingModalOpen(false)} disabled={isProcessingBooking}>
                    Cancel
                  </Button>
                  <Button type="submit" onClick={handleConfirmBooking} disabled={isProcessingBooking || requestedSeats > selectedRideForBooking.availableSeats || requestedSeats <= 0}>
                    {isProcessingBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Confirm Request
                  </Button>
                </DialogFooter>
           
          </DialogContent>
        </Dialog>
      )}


      
    </div>
  );
}