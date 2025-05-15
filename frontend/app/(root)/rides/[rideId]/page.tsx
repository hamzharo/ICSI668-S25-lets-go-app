// app/(root)/rides/[rideId]/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { RideDetail } from '@/types'; // Using RideDetail as per your import. Ensure it's comprehensive.
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'react-toastify';
import {
  Loader2, MapPin, CalendarDays, Clock, Users, Car, UserCircle, DollarSign, ArrowLeft, Info, AlertTriangle
} from 'lucide-react';
import { format, isValid } from 'date-fns';
// Separator might be useful for layout
// import { Separator } from '@/components/ui/separator';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const fetchRideDetailsApi = async (rideId: string, token: string | null): Promise<RideDetail> => {
  if (!token) throw new Error("Authentication required.");
  console.log(`API CALL: Fetching details for ride ${rideId} (RideDetailsPage)`);
  const response = await fetch(`${API_BASE_URL}/api/rides/${rideId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    let errorMessage = `Failed to load ride details (Status: ${response.status})`;
    if (response.status === 404) {
        errorMessage = "Ride not found or has been cancelled.";
    } else {
        try {
            const errorResult = await response.json();
            errorMessage = errorResult.message || errorResult.error || errorMessage;
        } catch (e) {
            if(response.statusText) errorMessage = `Failed to load ride details: ${response.statusText}`;
        }
    }
    console.error("Error fetching ride details on page:", response.status, errorMessage);
    throw new Error(errorMessage);
  }
  return response.json();
};


export default function RideDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();

  const rideId = params.rideId as string;

  const [ride, setRide] = useState<RideDetail | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRideData = useCallback(async () => {
    if (!rideId) {
        setError("Ride ID is missing.");
        setIsLoadingPage(false);
        return;
    }
    if (!authLoading && !token) {
        toast.error("Please log in to view ride details.");
        // router.replace(`/sign-in?redirect=/rides/${rideId}`); // Use sign-in, not login
        setIsLoadingPage(false);
        setError("Authentication required.");
        return;
    }
    if (token) { // Proceed only if token is available
        setIsLoadingPage(true);
        setError(null);
        try {
            const rideData = await fetchRideDetailsApi(rideId, token);
            setRide(rideData);
        } catch (err: any) {
            console.error("Failed to load ride details:", err);
            setError(err.message || "Could not load ride details.");
            // toast.error(err.message || "Could not load ride details."); // Toasting here might be redundant if error is displayed
        } finally {
            setIsLoadingPage(false);
        }
    }
  }, [rideId, token, authLoading, router]); // Removed 'user' as token is the primary auth check here for fetching

  useEffect(() => {
    // Load data when component mounts or when rideId/token changes (after auth check)
    if (!authLoading) { // Wait for auth state to resolve
        loadRideData();
    }
  }, [authLoading, loadRideData]); // loadRideData dependency is important


  const formatDateSafe = (dateString: string | undefined | null, formatString: string = "EEEE, MMM d, yyyy 'at' h:mm a") => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isValid(date) ? format(date, formatString) : 'Invalid Date';
  };

  const driverDisplayName = ride?.driverFirstName
    ? `${ride.driverFirstName}${ride.driverLastName ? ` ${ride.driverLastName.charAt(0)}.` : ''}`
    : 'Driver';

  const driverInitials = ride?.driverFirstName
    ? `${ride.driverFirstName.charAt(0)}${ride.driverLastName ? ride.driverLastName.charAt(0) : ''}`.toUpperCase()
    : 'DR';


  if (isLoadingPage || authLoading) {
    return (
        <div className="flex flex-col flex-grow items-center justify-center h-[calc(100vh-150px)] min-h-[300px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Loading Ride Details...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col flex-grow items-center justify-center h-[calc(100vh-150px)] min-h-[300px] p-6 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" /> {/* Changed icon */}
            <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Ride</h2>
            <p className="text-muted-foreground max-w-md mb-6">{error}</p>
            <div className="flex gap-4">
                <Button onClick={() => router.back()} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
                <Button onClick={loadRideData} disabled={isLoadingPage}>
                    {isLoadingPage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Try Again
                </Button>
            </div>
        </div>
    );
  }

  if (!ride) {
    return (
        <div className="flex flex-col flex-grow items-center justify-center h-[calc(100vh-150px)] min-h-[300px] p-6 text-center">
            <Info className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Ride Information Not Available</h2>
            <p className="text-muted-foreground max-w-md mb-6">
                The details for this ride could not be found. It might have been cancelled or no longer exists.
            </p>
            <Button onClick={() => router.back()} variant="default">
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
        </div>
    );
  }

  // Helper for list items
  const DetailListItem = ({ Icon, label, value, valueClass = "text-muted-foreground" }: { Icon: React.ElementType, label: string, value: string | number | undefined | null, valueClass?: string }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <li className="flex items-start">
            <Icon className="mr-3 h-5 w-5 text-indigo-500 mt-1 flex-shrink-0" />
            <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">{label}:</span>
                <p className={`${valueClass} text-sm`}>{String(value)}</p>
            </div>
        </li>
    );
  };


  return (
    <div className="container mx-auto max-w-3xl p-4 py-8 md:p-6 lg:p-8">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bookings
        </Button>

        <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-slate-800 dark:to-slate-800/50 border-b dark:border-slate-700 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div>
                        <CardTitle className="text-2xl md:text-3xl font-bold text-primary dark:text-sky-400 flex items-center">
                            <MapPin className="mr-2.5 h-7 w-7" />
                            <span>{ride.departureCity} <ArrowRight className="inline mx-1 h-5 w-5 text-muted-foreground" /> {ride.destinationCity}</span>
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-1.5">
                            Ride ID: {ride.id} <span className="mx-1">|</span> Status:
                            <span className={`ml-1 font-semibold capitalize ${
                                ride.status === 'SCHEDULED' ? 'text-green-600 dark:text-green-400' :
                                ride.status.startsWith('CANCELLED') ? 'text-red-600 dark:text-red-400' :
                                'text-gray-600 dark:text-gray-400'
                            }`}>
                                {ride.status.replace(/_/g, ' ').toLowerCase()}
                            </span>
                        </CardDescription>
                    </div>
                    <div className="mt-2 sm:mt-0 text-left sm:text-right flex-shrink-0">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400 flex items-center sm:justify-end">
                            <DollarSign className="h-7 w-7 mr-1"/>
                            {ride.pricePerSeat?.toFixed(2) ?? 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground text-right">per seat</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                {/* Section for Driver */}
                {(ride.driverFirstName || ride.driverProfilePictureUrl) && (
                    <section>
                        <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">Driver</h3>
                        <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={ride.driverProfilePictureUrl || undefined} alt={`${driverDisplayName}'s avatar`} />
                                <AvatarFallback className="text-xl">{driverInitials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">{driverDisplayName}</p>
                                {/* Add driver rating or other info if available in RideDetail */}
                                {/* {ride.driverRating && <p className="text-sm text-amber-500">{ride.driverRating.toFixed(1)} ★</p>} */}
                            </div>
                        </div>
                        {ride.driverBio && <p className="text-sm text-muted-foreground italic mt-3 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">"{ride.driverBio}"</p>}
                    </section>
                )}

                {/* Section for Ride Details */}
                <section>
                    <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">Ride Details</h3>
                    <ul className="space-y-3">
                        <DetailListItem Icon={CalendarDays} label="Departure" value={formatDateSafe(ride.departureTime)} />
                        {ride.estimatedArrivalTime && <DetailListItem Icon={Clock} label="Estimated Arrival" value={formatDateSafe(ride.estimatedArrivalTime)} />}
                        {/* Assuming RideDetail has departureAddress and destinationAddress as optional fields */}
                        {ride.departureAddress && <DetailListItem Icon={MapPin} label="Pickup Address" value={ride.departureAddress} />}
                        {ride.destinationAddress && <DetailListItem Icon={MapPin} label="Drop-off Address" value={ride.destinationAddress} />}
                        <DetailListItem Icon={Users} label="Seats Available" value={`${ride.availableSeats} of ${ride.totalSeats || ride.availableSeats}`} />
                        {/* Add other details like intermediateStops if present in RideDetail */}
                    </ul>
                </section>

                {/* Section for Vehicle Details */}
                {(ride.vehicleMake || ride.vehicleModel || ride.vehicleColor || ride.vehicleYear || ride.vehicleDescription) && (
                    <section>
                        <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">Vehicle</h3>
                        <ul className="space-y-3 text-sm">
                            {ride.vehicleDescription && <DetailListItem Icon={Car} label="Description" value={ride.vehicleDescription} />}
                            {/* Or show individual fields if available */}
                            {!ride.vehicleDescription && ride.vehicleMake && <DetailListItem Icon={Car} label="Make & Model" value={`${ride.vehicleMake} ${ride.vehicleModel || ''}`} />}
                            {!ride.vehicleDescription && ride.vehicleColor && <DetailListItem Icon={Car} label="Color" value={ride.vehicleColor} />}
                            {!ride.vehicleDescription && ride.vehicleYear && <DetailListItem Icon={Car} label="Year" value={ride.vehicleYear} />}
                        </ul>
                    </section>
                )}

                {/* Add sections for Ride Rules, Preferences etc. if those fields are in RideDetail */}

            </CardContent>

            {/* CardFooter can be used for actions like "Book this Ride" or "Message Driver"
                This would require additional logic and API calls not covered in this focused display component.
            */}
            {/*
            <CardFooter className="p-6 border-t dark:border-slate-700">
                <Button size="lg" className="w-full">Book this Ride</Button>
            </CardFooter>
            */}
        </Card>

        {/* ChatWindow could be added here if the user has a relevant booking or is the driver */}
        {/* Example: {userIsRelatedToRide && <ChatWindow rideId={ride.id} />} */}
    </div>
  );
}