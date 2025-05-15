// frontend/app/(root)/search-rides/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import RideSearchForm from '@/components/rides/RideSearchForm';
import RideCard from '@/components/rides/RideCard'; // Ensure this component exists and is correctly imported
import { RideSearchResult, RideSearchFormValues } from '@/types'; // Ensure types are correctly defined and imported
import { useAuth } from '@/lib/AuthContext'; // Your authentication context
import { toast } from 'react-toastify'; // For user notifications
import { Loader2, SearchX, Frown } from 'lucide-react'; // Icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Your UI components
import { Separator } from '@/components/ui/separator'; // Your UI components

// API function to search for rides
const searchRidesApi = async (params: RideSearchFormValues, token: string | null): Promise<RideSearchResult[]> => {
  console.log("[searchRidesApi] Received search params:", params);

  // Example: Make auth optional for search via an environment variable
  // const requireAuth = process.env.NEXT_PUBLIC_REQUIRE_AUTH_FOR_SEARCH === 'true';
  // if (requireAuth && !token) {
  //   console.error("[searchRidesApi] Authentication token is required but not provided.");
  //   throw new Error("Authentication required to search rides.");
  // }

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
      // Ensure the date string from <input type="datetime-local"> is converted to full ISO string
      const isoTime = new Date(params.earliestDepartureTime).toISOString();
      queryParams.append('earliestDepartureTime', isoTime);
      console.log("[searchRidesApi] Appended earliestDepartureTime as ISO:", isoTime);
    } catch (e) {
      console.error("[searchRidesApi] Invalid date format for earliestDepartureTime:", params.earliestDepartureTime, e);
      // Decide if you want to throw an error or let the backend handle it (it will default to LocalDateTime.now())
      // For now, we'll just log it and the backend will use its default if the param is missing/invalid
    }
  } else {
    console.log("[searchRidesApi] earliestDepartureTime not provided by form, backend will use default.");
  }

  const apiUrl = `${baseUrl}/api/rides/search?${queryParams.toString()}`;
  console.log(`[searchRidesApi] Attempting to fetch: GET ${apiUrl}`);

  const headers: HeadersInit = {
    'Accept': 'application/json', // Important: Tell the server we expect JSON
    // 'Content-Type': 'application/json', // Not strictly needed for GET requests without a body
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log("[searchRidesApi] Authorization header added.");
  } else {
    console.log("[searchRidesApi] No token provided, request will be unauthenticated (if allowed by backend).");
  }

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: headers,
  });

  console.log(`[searchRidesApi] Response Status: ${response.status}`);

  if (response.status === 204) { // No Content
    console.log("[searchRidesApi] Received 204 No Content: No rides found.");
    return [];
  }

  // Try to get response text for better debugging, especially for non-JSON error responses
  const responseText = await response.text(); // Get raw response text first

  if (!response.ok) {
    let errorMsg = `API Error (${response.status}): ${response.statusText || 'Failed to fetch rides.'}`;
    let errorDetails = null;
    try {
      errorDetails = JSON.parse(responseText); // Try to parse as JSON
      // Adjust to your backend's error DTO structure
      errorMsg = errorDetails.message || errorDetails.error || errorDetails.title || errorMsg;
      console.error("[searchRidesApi] Parsed API Error Details:", errorDetails);
    } catch (e) {
      console.error("[searchRidesApi] Failed to parse error response as JSON. Raw text:", responseText);
      // If not JSON, use the raw text if it's informative, or stick to status text
      if(responseText && responseText.length < 500) { // Avoid logging huge HTML error pages
        errorMsg = `${errorMsg} - ${responseText}`;
      }
    }
    console.error("[searchRidesApi] Full error message to be thrown:", errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const results = JSON.parse(responseText); // Now parse the successful response text
    console.log("[searchRidesApi] Successfully fetched and parsed rides:", results);
    return results as RideSearchResult[];
  } catch (e) {
    console.error("[searchRidesApi] Failed to parse successful response as JSON. Raw text:", responseText, e);
    throw new Error("Received malformed data from the server.");
  }
};

export default function SearchRidesPage() {
  const { token, isLoading: authLoading, user } = useAuth();
  const [searchResults, setSearchResults] = useState<RideSearchResult[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Effect to clear results/error if user logs out or auth state changes
  useEffect(() => {
    if (!user && !authLoading) { // Check authLoading to prevent premature clearing
      console.log("[SearchRidesPage] User logged out or auth state changed, clearing search results.");
      setSearchResults([]);
      setSearchAttempted(false);
      setSearchError(null);
    }
  }, [user, authLoading]);

  const handleSearch = async (searchParams: RideSearchFormValues) => {
    console.log("[handleSearch] Initiating search with form params:", searchParams);

    // Check if authentication is still loading, might be too early to check token
    if (authLoading) {
      toast.info("Authenticating... please wait before searching.");
      console.log("[handleSearch] Authentication still loading, search deferred.");
      return;
    }

    // Example: Make auth optional via environment variable
    // const requireAuth = process.env.NEXT_PUBLIC_REQUIRE_AUTH_FOR_SEARCH === 'true';
    // if (requireAuth && !token) {
    //   toast.error("Please log in to search for rides.");
    //   console.log("[handleSearch] User not logged in, but authentication is required for search.");
    //   return;
    // }

    setIsLoadingSearch(true);
    setSearchAttempted(true);
    setSearchError(null);
    setSearchResults([]); // Clear previous results immediately

    try {
      const results = await searchRidesApi(searchParams, token);
      setSearchResults(results);
      if (results.length === 0 && searchAttempted) { // Ensure search was actually attempted
        toast.info("No rides found matching your criteria.");
      } else if (results.length > 0) {
        toast.success(`Found ${results.length} ride(s).`);
      }
    } catch (error: any) {
      console.error("[handleSearch] Search failed:", error);
      const errorMessage = error.message || "An unexpected error occurred. Please try again.";
      setSearchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingSearch(false);
      console.log("[handleSearch] Search process finished.");
    }
  };

  // Initial loading state for the page, primarily for auth
  if (authLoading) {
    console.log("[SearchRidesPage] Auth is loading, showing page loader.");
    return (
      <div className="flex flex-grow items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading authentication...</p>
      </div>
    );
  }

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

      {/* Search Results Section */}
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
            <AlertDescription>
              {searchError}
            </AlertDescription>
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
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}