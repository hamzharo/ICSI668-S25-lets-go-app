// frontend/app/(root)/driver/my-rides/[rideId]/edit/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import EditRideForm from '@/components/driver/EditRideForm'; // You'll need to create/update this
import { DriverOfferedRide, RideUpdateDTO } from '@/types'; // Add RideUpdateDTO if not already there
import { Loader2, ArrowLeft, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// API call to fetch a single ride for editing
const fetchRideToEditApi = async (rideId: string, token: string | null): Promise<DriverOfferedRide> => {
  if (!token) throw new Error("Authentication required.");
  
  // IMPORTANT: Adjust this URL to your actual backend endpoint for fetching a single ride.
  // This could be /api/rides/{rideId} (general) or /api/driver/rides/{rideId} (driver-specific)
  const url = `${API_BASE_URL}/api/rides/${rideId}`; // ASSUMPTION: General endpoint
  console.log(`API CALL: Fetching ride ${rideId} for editing from ${url}`);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to fetch ride. Status: ${response.status}` }));
    let errorMessage = errorData.message || `Failed to fetch ride details for editing.`;
    if (response.status === 404) errorMessage = "Ride not found.";
    if (response.status === 403) errorMessage = "You are not authorized to view this ride's details.";
    
    const error = new Error(errorMessage) as any;
    error.status = response.status; // Attach status to error object
    throw error;
  }
  
  const rideData = await response.json();
  console.log("Fetched ride data for edit:", rideData);
  // Add any necessary transformations here if backend DTO differs significantly from DriverOfferedRide
  return rideData as DriverOfferedRide;
};


export default function EditRidePage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();

  const rideId = params.rideId as string;

  const [initialRideData, setInitialRideData] = useState<DriverOfferedRide | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error("Please log in to edit rides.");
      router.replace(`/login?redirect=/driver/my-rides/${rideId}/edit`);
      setIsLoadingPage(false); // Stop loading as we are redirecting
      return;
    }

    if (!user.roles.includes("DRIVER")) {
      toast.error("Only drivers can edit rides.");
      router.replace('/');
      setIsLoadingPage(false); // Stop loading
      return;
    }

    if (rideId && token) {
      setIsLoadingPage(true);
      setError(null);
      fetchRideToEditApi(rideId, token)
        .then(data => {
          // Backend should ensure the driver owns this ride and it's editable.
          // The client-side check is an additional safeguard.
          if (data.status !== 'SCHEDULED') {
            throw new Error("This ride cannot be edited as it's no longer in a scheduled state.");
          }
          setInitialRideData(data);
        })
        .catch(err => {
          console.error("Failed to load ride for editing:", err);
          let errorMessage = err.message || "Could not load ride details. Please try again.";
          // err.status might be set by fetchRideToEditApi
          if ((err as any).status === 404) errorMessage = "Ride not found or you don't have access to edit it.";
          else if ((err as any).status === 403) errorMessage = "You are not authorized to edit this ride.";
          
          setError(errorMessage);
          toast.error(errorMessage);
        })
        .finally(() => {
          setIsLoadingPage(false);
        });
    } else if (!rideId) {
        setError("Ride ID is missing from the URL.");
        toast.error("Ride ID is missing.");
        setIsLoadingPage(false);
    } else if (!token && user) { // User loaded but token not yet available (should be rare if authLoading is handled)
        setError("Authentication token not available. Please try again.");
        toast.warn("Authentication token not available. Please re-login if the issue persists.");
        setIsLoadingPage(false);
    }
  }, [rideId, token, user, authLoading, router]);

  const handleUpdateSuccess = () => {
    toast.success("Ride updated successfully!");
    toast.info("Redirecting to your offered rides...");
    router.push('/driver/my-rides');
  };

  if (isLoadingPage || authLoading) {
    return (
      <div className="flex flex-grow items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center p-6 text-center h-screen">
        <Frown className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Ride for Edit</h2>
        <p className="text-muted-foreground max-w-md mb-6">{error}</p>
        <Button onClick={() => router.push('/driver/my-rides')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Offered Rides
        </Button>
      </div>
    );
  }

  if (!initialRideData) {
    // This case should ideally be covered by the error state or loading state.
    // If it's reached, it means something went wrong without setting an error.
    return (
        <div className="flex flex-col flex-grow items-center justify-center p-6 text-center h-screen">
            <Frown className="h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-semibold text-yellow-600 mb-2">Ride Data Not Available</h2>
            <p className="text-muted-foreground max-w-md mb-6">
                The ride data could not be loaded for editing. This might be a temporary issue.
            </p>
            <Button onClick={() => router.push('/driver/my-rides')} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Offered Rides
            </Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow p-4 md:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            Edit Your Ride Offer
            </h1>
            <p className="text-lg text-muted-foreground dark:text-gray-400">
            Update the details for your ride from {initialRideData.departureCity} to {initialRideData.destinationCity}.
            </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/driver/my-rides')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel & Back to List
        </Button>
      </div>
      <Separator />
      {/* The EditRideForm will handle the actual PUT request for updates */}
      <EditRideForm
        rideId={rideId}
        initialData={initialRideData}
        onUpdateSuccess={handleUpdateSuccess}
        // You might also pass an onUpdateFailure or similar callback
      />
    </div>
  );
}