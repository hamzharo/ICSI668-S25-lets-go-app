// frontend/app/(root)/driver/my-rides/[rideId]/edit/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import EditRideForm from '@/components/driver/EditRideForm';
import { DriverOfferedRide } from '@/types'; // Type for the ride data
import { Loader2, AlertTriangle, ArrowLeft, Frown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-toastify';

// --- TODO: Replace with actual API service call to fetch a single ride for editing ---
const fetchRideToEditApi = async (rideId: string, token: string | null): Promise<DriverOfferedRide> => {
  if (!token) throw new Error("Authentication required.");
  console.log(`API CALL: Fetching ride ${rideId} for editing`);
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/driver/rides/${rideId}`, { // Or /api/rides/${rideId}
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // if (!response.ok) {
  //   if (response.status === 404) throw new Error("Ride not found.");
  //   if (response.status === 403) throw new Error("You are not authorized to edit this ride.");
  //   const errorResult = await response.json().catch(() => ({ message: "Failed to fetch ride details for editing." }));
  //   throw new Error(errorResult.message);
  // }
  // return response.json();

  // Mock API response:
  return new Promise((resolve, reject) => setTimeout(() => {
    if (rideId === "non_existent_ride_for_edit") {
        const err = new Error("Ride not found for editing.") as any; err.status = 404; reject(err);
    } else if (rideId === "unauthorized_ride_for_edit") {
        const err = new Error("Not authorized to edit this ride.") as any; err.status = 403; reject(err);
    }
    else {
        resolve({
            id: rideId,
            departureCity: 'Downtown Mock',
            destinationCity: 'Airport Mock',
            departureTime: new Date(Date.now() + 86400000 * 3).toISOString(),
            estimatedArrivalTime: new Date(Date.now() + 86400000 * 3 + 7200000).toISOString(),
            availableSeats: 2,
            totalSeats: 3,
            pricePerSeat: 22.50,
            vehicleDescription: "Mock Tesla Model 3, White",
            status: 'SCHEDULED', // Important: Only scheduled rides should be editable
            createdAt: new Date().toISOString(),
            rideNotes: "This is a mock ride note for editing.",
            // Ensure this structure matches DriverOfferedRide
        });
    }
  }, 1000));
};
// --- End TODO ---


export default function EditRidePage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();

  const rideId = params.rideId as string;

  const [initialRideData, setInitialRideData] = useState<DriverOfferedRide | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return; // Wait for auth context to load

    if (!user) {
      toast.error("Please log in to edit rides.");
      router.replace(`/login?redirect=/driver/my-rides/${rideId}/edit`);
      setIsLoadingPage(false);
      return;
    }

    if (user.role !== 'DRIVER') {
      toast.error("Only drivers can edit rides.");
      router.replace('/'); // Redirect to dashboard
      setIsLoadingPage(false);
      return;
    }

    if (rideId && token) {
      setIsLoadingPage(true);
      setError(null);
      fetchRideToEditApi(rideId, token)
        .then(data => {
          if (data.status !== 'SCHEDULED') {
            // This check might also be done on the backend before returning data
            throw new Error("This ride cannot be edited as it's no longer in a scheduled state.");
          }
          // Backend should also verify ownership (driverId === user.id)
          setInitialRideData(data);
        })
        .catch(err => {
          console.error("Failed to load ride for editing:", err);
          let errorMessage = err.message || "Could not load ride details. Please try again.";
          if (err.status === 404) errorMessage = "Ride not found or you don't have access to edit it.";
          if (err.status === 403) errorMessage = "You are not authorized to edit this ride.";
          setError(errorMessage);
          toast.error(errorMessage);
        })
        .finally(() => {
          setIsLoadingPage(false);
        });
    } else if (!rideId) {
        setError("Ride ID is missing.");
        setIsLoadingPage(false);
    }
  }, [rideId, token, user, authLoading, router]);

  const handleUpdateSuccess = () => {
    toast.info("Redirecting to your offered rides...");
    router.push('/driver/my-rides'); // Navigate back to the list after successful update
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
      <div className="flex flex-col flex-grow items-center justify-center p-6 text-center">
        <Frown className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Ride</h2>
        <p className="text-muted-foreground max-w-md mb-6">{error}</p>
        <Button onClick={() => router.push('/driver/my-rides')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Offered Rides
        </Button>
      </div>
    );
  }

  if (!initialRideData) {
    // Should be caught by error state, but as a fallback
    return <div className="flex flex-grow items-center justify-center p-6">Ride data not available for editing.</div>;
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
      <EditRideForm
        rideId={rideId}
        initialData={initialRideData}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
}