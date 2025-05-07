// frontend/app/(root)/rides/[rideId]/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useWebSocket } from '@/lib/WebSocketContext';
import { RideDetail, UserRideBookingStatus, BookingStatus } from '@/types'; // Ensure these types are comprehensive
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input"; // For seatsToBook
import { Label } from "@/components/ui/label"; // For seatsToBook label
import { toast } from 'react-toastify';
import {
  Loader2, MapPin, CalendarDays, Clock, Users, Car, UserCircle, DollarSign, ArrowLeft, Info, Send, CheckCircle, XCircle, Hourglass, WifiOff, Wifi, MessageCircle, ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { StompSubscription } from '@stomp/stompjs';
import ChatWindow from '@/components/chat/ChatWindow'; // Import ChatWindow
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// --- TODO: Replace with actual API service calls (implement these in a service file ideally) ---
const fetchRideDetailsApi = async (rideId: string, token: string | null): Promise<RideDetail> => {
  if (!token) throw new Error("Authentication required.");
  console.log(`API CALL: Fetching details for ride ${rideId}`);
  const response = await fetch(`${API_BASE_URL}/api/rides/${rideId}`, { // Assuming this endpoint exists
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    if (response.status === 404) throw new Error("Ride not found.");
    const errorResult = await response.json().catch(() => ({ message: "Failed to fetch ride details." }));
    throw new Error(errorResult.message);
  }
  return response.json();

  // Mock:
  // return new Promise((resolve, reject) => setTimeout(() => { /* ... mock data ... */ }, 1000));
};

const requestBookingApi = async (rideId: string, numberOfSeats: number, token: string | null): Promise<{ message: string, bookingStatus: UserRideBookingStatus, updatedRide?: RideDetail }> => {
  if (!token) throw new Error("Authentication required.");
  console.log(`API CALL: Requesting ${numberOfSeats} seat(s) for ride ${rideId}`);
  const response = await fetch(`${API_BASE_URL}/api/rides/request/${rideId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ numberOfSeats }) // Adjust payload as per backend
  });
  if (!response.ok) {
    const errorResult = await response.json().catch(() => ({ message: "Booking request failed." }));
    throw new Error(errorResult.message);
  }
  return response.json(); // Expect message, new booking status, and optionally the updated ride object
  // Mock:
  // return new Promise(resolve => setTimeout(() => { resolve({ message: "Booking request sent!", bookingStatus: { bookingId: `booking_${Date.now()}`, status: 'REQUESTED', seatsBooked: numberOfSeats } }); }, 1000));
};

// Fetches if the current user has an existing booking/request for THIS ride.
const fetchUserBookingStatusForRideApi = async (rideId: string, userId: string, token: string | null): Promise<UserRideBookingStatus | null> => {
    if (!token) return null;
    console.log(`API CALL: Fetching booking status for user ${userId} on ride ${rideId}`);
    // This might be part of the /api/rides/{rideId} response or a separate endpoint e.g., /api/bookings/ride/{rideId}/my-status
    // const response = await fetch(`${API_BASE_URL}/api/bookings/ride/${rideId}/my-status`, {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
    // if (!response.ok) {
    //     if (response.status === 404) return null; // No booking found
    //     throw new Error("Failed to fetch user booking status.");
    // }
    // return response.json();
    // Mock:
    return null;
};
// --- End TODO ---


export default function RideDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const { stompClient, isConnected, subscribe } = useWebSocket();

  const rideId = params.rideId as string;

  const [ride, setRide] = useState<RideDetail | null>(null);
  const [userBookingStatus, setUserBookingStatus] = useState<UserRideBookingStatus | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false); // For controlling chat accordion

  const rideStatusSubscriptionRef = useRef<StompSubscription | null>(null);


  const loadRideData = useCallback(async () => {
    if (rideId && token && user) {
        setIsLoadingPage(true);
        setError(null);
        try {
            const [rideData, bookingStatusData] = await Promise.all([
                fetchRideDetailsApi(rideId, token),
                fetchUserBookingStatusForRideApi(rideId, user.id, token)
            ]);
            setRide(rideData);
            setUserBookingStatus(bookingStatusData);
            // If ride status from fetch is already terminal, no need to adjust seats to book too high
            if (rideData && rideData.status !== 'SCHEDULED') {
                setSeatsToBook(1);
            } else if (rideData) {
                setSeatsToBook(Math.min(1, rideData.availableSeats));
            }

        } catch (err: any) {
            console.error("Failed to load ride details:", err);
            let msg = err.message || "Could not load ride details.";
            if (String(err.message).toLowerCase().includes("not found")) msg = "Ride not found or may have been cancelled.";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoadingPage(false);
        }
    } else if (!authLoading && !token) {
        toast.error("Please log in to view ride details.");
        router.replace(`/login?redirect=/rides/${rideId}`);
        setIsLoadingPage(false);
    }
  }, [rideId, token, user, authLoading, router]); // Added user to ensure it's available for fetchUserBookingStatusForRideApi

  useEffect(() => {
    loadRideData();
  }, [loadRideData]); // Load data on mount / relevant changes


  // WebSocket subscription for ride status updates
  useEffect(() => {
    if (isConnected && stompClient && rideId && ride && !rideStatusSubscriptionRef.current) {
      const destination = `/topic/ride/${rideId}/status`;
      console.log(`RideDetails: Subscribing to WebSocket destination: ${destination}`);

      rideStatusSubscriptionRef.current = subscribe(destination, (message) => {
        console.log(`RideDetails: WebSocket message received for ${destination}:`, message.body);
        try {
          let newStatus: RideDetail['status'];
          let newAvailableSeats: number | undefined;

          try {
            const payload = JSON.parse(message.body);
            newStatus = payload.newStatus || payload.status;
            newAvailableSeats = payload.availableSeats;
          } catch (e) {
            newStatus = message.body as RideDetail['status'];
          }

          if (newStatus) {
            setRide((prevRide) => {
              if (prevRide) {
                let updated = false;
                const updatedRide = { ...prevRide };
                if (prevRide.status !== newStatus) {
                    updatedRide.status = newStatus;
                    toast.info(`Ride status updated to: ${newStatus.replace(/_/g, ' ').toLowerCase()}`);
                    updated = true;
                }
                if (newAvailableSeats !== undefined && newAvailableSeats !== prevRide.availableSeats) {
                    updatedRide.availableSeats = newAvailableSeats;
                    toast.info(`Available seats updated to: ${newAvailableSeats}`);
                    updated = true;
                }
                return updated ? updatedRide : prevRide;
              }
              return prevRide;
            });
          }
        } catch (e) {
          console.error("Error processing WebSocket ride status message:", e);
        }
      });
    }
    // Cleanup
    return () => {
      if (rideStatusSubscriptionRef.current) {
        console.log(`RideDetails: Unsubscribing from /topic/ride/${rideId}/status`);
        rideStatusSubscriptionRef.current.unsubscribe();
        rideStatusSubscriptionRef.current = null;
      }
    };
  }, [isConnected, stompClient, rideId, ride, subscribe]);


  const handleBookingRequest = async () => {
    if (!ride || !token || !user) return;
    if (seatsToBook > ride.availableSeats) { toast.error(`Only ${ride.availableSeats} seat(s) available.`); return; }
    if (seatsToBook <= 0) { toast.error("Please select at least 1 seat to book."); return; }

    setIsBooking(true);
    try {
      const result = await requestBookingApi(ride.id, seatsToBook, token);
      setUserBookingStatus(result.bookingStatus); // Update local booking status
      toast.success(result.message);
      // If API returns updated ride details (e.g., new availableSeats count)
      if (result.updatedRide) {
        setRide(result.updatedRide);
      } else {
        // Or refetch ride details to get fresh data, though WS might cover this
        loadRideData();
      }
    } catch (err: any) {
      toast.error(err.message || "Booking request failed.");
    } finally {
      setIsBooking(false);
    }
  };

  const canRequestBooking = ride && ride.status === 'SCHEDULED' && ride.availableSeats > 0 && user?.id !== ride.driverId && (!userBookingStatus || userBookingStatus.status === undefined || userBookingStatus.status === 'REJECTED_BY_DRIVER' || userBookingStatus.status === 'CANCELLED_BY_PASSENGER');
  const showChat = user && ride && (user.id === ride.driverId || userBookingStatus?.status === 'CONFIRMED' || userBookingStatus?.status === 'REQUESTED'); // Allow chat for requested state too

  if (isLoadingPage || authLoading) { /* ... Loader ... */ return <div className="flex flex-grow items-center justify-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>; }
  if (error) { /* ... Error display ... */ return ( <div className="flex flex-col flex-grow items-center justify-center p-6 text-center"> <Frown className="h-16 w-16 text-destructive mb-4" /> <h2 className="text-2xl font-semibold text-destructive mb-2">Oops!</h2> <p className="text-muted-foreground max-w-md mb-6">{error}</p> <Button onClick={() => router.back()} variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button> </div> ); }
  if (!ride) { /* ... No ride data ... */ return <div className="flex flex-grow items-center justify-center p-6">Ride data not found or not available.</div>; }

  const renderBookingStatusInfo = () => { /* ... (same as before) ... */ if (!userBookingStatus || !userBookingStatus.status) return null; let statusText = ''; let IconComponent = Info; let alertVariant: "default" | "destructive" | "success" | "warning" = "default"; switch (userBookingStatus.status) { case 'REQUESTED': statusText = `Your booking request for ${userBookingStatus.seatsBooked} seat(s) is pending.`; IconComponent = Hourglass; alertVariant = "warning"; break; case 'CONFIRMED': statusText = `Your booking for ${userBookingStatus.seatsBooked} seat(s) is confirmed!`; IconComponent = CheckCircle; alertVariant = "success"; break; case 'REJECTED_BY_DRIVER': statusText = `Your booking request for ${userBookingStatus.seatsBooked} seat(s) was rejected.`; IconComponent = XCircle; alertVariant = "destructive"; break; case 'CANCELLED_BY_PASSENGER': statusText = `You cancelled your booking for ${userBookingStatus.seatsBooked} seat(s).`; IconComponent = Info; break; default: return null; } return (<Alert variant={alertVariant as any} className="my-6"><IconComponent className="h-5 w-5" /><AlertTitle className="font-semibold">Booking Status</AlertTitle><AlertDescription>{statusText}</AlertDescription></Alert>); };

  return (
    <div className="flex flex-col flex-grow p-4 md:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="self-start">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <div className={`flex items-center text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300'}`}>
                {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                {isConnected ? 'Live On' : 'Live Off'}
            </div>
        </div>

        <Card className="shadow-xl">
            <CardHeader className="bg-slate-50 dark:bg-slate-800/60 border-b dark:border-slate-700 pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <CardTitle className="text-2xl md:text-3xl font-bold text-primary flex items-center">
                            <MapPin className="mr-2 h-6 w-6 text-blue-500" />
                            {ride.departureCity} <ArrowRight className="mx-2 h-5 w-5 text-muted-foreground" /> {ride.destinationCity}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-1">
                            Ride ID: {ride.id}
                        </CardDescription>
                    </div>
                    <div className="mt-3 sm:mt-0 text-left sm:text-right">
                        <p className="text-2xl font-bold text-green-600 flex items-center sm:justify-end">
                            <DollarSign className="h-6 w-6 mr-1"/>
                            {ride.pricePerSeat.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">per seat</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
                {renderBookingStatusInfo()}

                <div className="flex items-center text-lg pb-2 border-b dark:border-gray-700">
                    <Info className="mr-3 h-5 w-5 text-teal-600 dark:text-teal-400" />
                    <strong className="text-gray-700 dark:text-gray-200">Status:</strong> 
                    <span className={`capitalize font-semibold ${
                        ride.status === 'SCHEDULED' ? 'text-green-600 dark:text-green-400' :
                        ride.status === 'IN_PROGRESS' ? 'text-orange-600 dark:text-orange-400' :
                        ride.status === 'COMPLETED' ? 'text-blue-600 dark:text-blue-400' :
                        (ride.status === 'CANCELLED_BY_DRIVER' || ride.status === 'CANCELLED_SYSTEM') ? 'text-red-600 dark:text-red-400' :
                        'text-gray-600 dark:text-gray-400'
                    }`}>
                        {ride.status.replace(/_/g, ' ').toLowerCase()}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-2">
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Ride Details</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start"><CalendarDays className="mr-3 h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" /> <div><strong>Departure:</strong><br/><span className="text-muted-foreground">{format(new Date(ride.departureTime), "EEEE, MMM d, yyyy 'at' h:mm a")}</span></div></li>
                            <li className="flex items-start"><Clock className="mr-3 h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" /> <div><strong>Est. Arrival:</strong><br/><span className="text-muted-foreground">{format(new Date(ride.estimatedArrivalTime), "EEEE, MMM d, yyyy 'at' h:mm a")}</span></div></li>
                            <li className="flex items-center"><Users className="mr-3 h-5 w-5 text-orange-500 flex-shrink-0" /> <strong>Seats Available:</strong> <span className="text-muted-foreground font-semibold">{ride.availableSeats}</span></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Driver & Vehicle</h3>
                        <div className="flex items-center mb-3">
                            <Avatar className="h-12 w-12 mr-3 flex-shrink-0">
                                <AvatarImage src={ride.driverProfilePictureUrl || undefined} alt={`${ride.driverFirstName}'s avatar`} />
                                <AvatarFallback>{ride.driverFirstName?.[0]}{ride.driverLastName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-100">{ride.driverFirstName} {ride.driverLastName || ''}</p>
                                {/* <p className="text-xs text-muted-foreground">Rating: {ride.driverRating || 'N/A'} ★</p> */}
                            </div>
                        </div>
                        {ride.driverBio && <p className="text-sm text-muted-foreground italic mb-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md">"{ride.driverBio}"</p>}
                        <ul className="space-y-1 text-sm">
                            {(ride.vehicleMake || ride.vehicleDescription) && <li className="flex items-center"><Car className="mr-3 h-5 w-5 text-gray-500 flex-shrink-0" /> <span className="text-muted-foreground">{ride.vehicleDescription || `${ride.vehicleMake} ${ride.vehicleModel} (${ride.vehicleColor}, ${ride.vehicleYear})`}</span></li>}
                        </ul>
                    </div>
                </div>
                {/* Ride Rules could be added here if available */}
            </CardContent>

            {canRequestBooking && (
                <CardFooter className="border-t dark:border-gray-700 p-6">
                    <div className="w-full flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="seatsToBook" className="text-sm font-medium whitespace-nowrap">Seats to Book:</Label>
                            <Input id="seatsToBook" type="number" min="1" max={ride.availableSeats > 0 ? ride.availableSeats : 1} value={seatsToBook}
                                onChange={(e) => setSeatsToBook(Math.max(1, Math.min(ride.availableSeats > 0 ? ride.availableSeats : 1, parseInt(e.target.value) || 1)))}
                                className="w-20 h-10" disabled={isBooking || ride.availableSeats === 0}
                            />
                        </div>
                        <Button size="lg" onClick={handleBookingRequest}
                            disabled={isBooking || ride.availableSeats === 0 || ride.status !== 'SCHEDULED'}
                            className="w-full sm:w-auto flex-grow bg-green-600 hover:bg-green-700 text-white">
                            {isBooking ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                            {isBooking ? `Requesting...` : `Request ${seatsToBook} Seat(s)`}
                        </Button>
                    </div>
                </CardFooter>
            )}
             {!canRequestBooking && ride.status === 'SCHEDULED' && user?.id !== ride.driverId && !userBookingStatus?.status && (
                 <CardFooter className="border-t dark:border-gray-700 p-6"> <Alert variant="default"> <Info className="h-5 w-5" /> <AlertTitle>Booking Information</AlertTitle> <AlertDescription> {ride.availableSeats === 0 ? "This ride is currently full." : "Review booking status above or contact support if you believe there's an issue."} </AlertDescription> </Alert> </CardFooter>
            )}
             {user?.id === ride.driverId && (
                 <CardFooter className="border-t dark:border-gray-700 p-6"> <Alert variant="default"> <Info className="h-5 w-5" /> <AlertTitle>Your Ride Offer</AlertTitle> <AlertDescription> This is one of your ride offers. Passengers can request to book this ride. You can manage this ride from your "My Offered Rides" page. <Link href="/driver/my-rides" className="block mt-2"> <Button variant="outline" size="sm">Go to My Offered Rides</Button> </Link> </AlertDescription> </Alert> </CardFooter>
            )}
        </Card>

        {/* Ride Chat Section - Show if user is driver OR confirmed/requested passenger */}
        {showChat && (
            <Accordion type="single" collapsible className="w-full mt-8" value={isChatOpen ? "ride-chat" : ""} onValueChange={(value) => setIsChatOpen(value === "ride-chat")}>
            <AccordionItem value="ride-chat" className="border dark:border-gray-700 rounded-lg shadow-md">
                <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gray-100 dark:bg-gray-700/60 rounded-t-lg text-gray-800 dark:text-gray-100">
                <div className="flex items-center text-lg font-semibold">
                    <MessageCircle className="mr-2 h-5 w-5 text-purple-500" />
                    Ride Chat ({isChatOpen ? "Hide" : "Show"})
                </div>
                </AccordionTrigger>
                <AccordionContent className="p-0 border-t dark:border-gray-700">
                <ChatWindow rideId={ride.id} />
                </AccordionContent>
            </AccordionItem>
            </Accordion>
        )}
    </div>
  );
}