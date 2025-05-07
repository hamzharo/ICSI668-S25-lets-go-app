// frontend/app/(root)/search-rides/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import RideSearchForm from '@/components/rides/RideSearchForm';
import RideCard from '@/components/rides/RideCard';
import { RideSearchResult, RideSearchFormValues } from '@/types';
import { useAuth } from '@/lib/AuthContext'; // To get the auth token for API calls
import { toast } from 'react-toastify';
import { Loader2, SearchX, Frown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';

// --- TODO: Replace with actual API service call ---
const searchRidesApi = async (params: RideSearchFormValues, token: string | null): Promise<RideSearchResult[]> => {
  if (!token) {
    throw new Error("Authentication required to search rides.");
  }

  const queryParams = new URLSearchParams({
    departureCity: params.departureCity,
    destinationCity: params.destinationCity,
    earliestDepartureTime: new Date(params.earliestDepartureTime).toISOString(), // Ensure ISO format for backend
    // Add other params like 'numberOfSeats' if your API supports them
  }).toString();

  console.log(`API CALL: Searching rides with params: ${queryParams}`);
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rides/search?${queryParams}`, {
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //   },
  // });

  // if (!response.ok) {
  //   const errorResult = await response.json().catch(() => ({ message: "Failed to search rides." }));
  //   throw new Error(errorResult.message || "An unexpected error occurred during search.");
  // }
  // return response.json();

  // Mock API response:
  return new Promise(resolve => setTimeout(() => {
    if (params.departureCity.toLowerCase() === "nocity") {
        resolve([]); // Simulate no results
    } else if (params.departureCity.toLowerCase() === "errorcity") {
        // Simulate an error condition from API, but here we'll just resolve empty for simplicity of mock
        // In real API, you'd throw new Error("Simulated API error");
        resolve([]);
        console.error("Simulated API error for errorcity");
    }
    else {
        resolve([
        { id: 'ride1_mock', driverId: 'driver1', driverFirstName: 'John', driverLastName: 'D.', departureCity: params.departureCity, destinationCity: params.destinationCity, departureTime: new Date(params.earliestDepartureTime).toISOString(), estimatedArrivalTime: new Date(new Date(params.earliestDepartureTime).getTime() + 3*60*60*1000).toISOString(), availableSeats: 3, pricePerSeat: 25.00, vehicleDescription: "Toyota Camry, White", status: 'SCHEDULED' },
        { id: 'ride2_mock', driverId: 'driver2', driverFirstName: 'Alice', driverLastName: 'W.', departureCity: params.departureCity, destinationCity: params.destinationCity, departureTime: new Date(new Date(params.earliestDepartureTime).getTime() + 1*60*60*1000).toISOString(), estimatedArrivalTime: new Date(new Date(params.earliestDepartureTime).getTime() + 4*60*60*1000).toISOString(), availableSeats: 1, pricePerSeat: 30.50, vehicleDescription: "Honda Civic, Blue", status: 'SCHEDULED' },
        ]);
    }
  }, 1500));
};
// --- End TODO ---


export default function SearchRidesPage() {
  const { token, isLoading: authLoading, user } = useAuth();
  const [searchResults, setSearchResults] = useState<RideSearchResult[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false); // To know if a search has been tried
  const [searchError, setSearchError] = useState<string | null>(null);

  // Effect to clear results if user logs out or token changes, etc.
  useEffect(() => {
      if (!user) {
          setSearchResults([]);
          setSearchAttempted(false);
      }
  }, [user]);

  const handleSearch = async (searchParams: RideSearchFormValues) => {
    if (authLoading) {
        toast.info("Authenticating... please wait.");
        return;
    }
    if (!token) {
      toast.error("Please log in to search for rides.");
      // Optionally redirect to login: router.push('/login');
      return;
    }

    setIsLoadingSearch(true);
    setSearchAttempted(true);
    setSearchError(null);
    setSearchResults([]); // Clear previous results

    try {
      const results = await searchRidesApi(searchParams, token);
      setSearchResults(results);
      if (results.length === 0) {
        // No specific error, just no results found
      }
    } catch (error: any) {
      console.error("Search failed:", error);
      setSearchError(error.message || "An unexpected error occurred. Please try again.");
      toast.error(error.message || "Failed to fetch rides. Please try again later.");
    } finally {
      setIsLoadingSearch(false);
    }
  };

  if (authLoading) {
      return <div className="flex flex-grow items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
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
      <section className="search-results">
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
              {searchError} Please check your search criteria or try again later.
            </AlertDescription>
          </Alert>
        )}

        {!isLoadingSearch && !searchError && searchAttempted && searchResults.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-10 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
            <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Rides Found</h2>
            <p className="text-muted-foreground max-w-md">
              We couldn't find any rides matching your current search criteria. Try adjusting your locations, dates, or check back later as new rides are added frequently.
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