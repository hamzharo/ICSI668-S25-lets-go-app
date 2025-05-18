// frontend/components/driver/DriverRideCard.tsx
'use client';

import React, { act, useState } from 'react';
import { DriverOfferedRide, BookingRequestSummary, BookingDTO, RideStatus } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from 'next/link';
import BookingRequestItem from './BookingRequestItem';
import {
  MapPin, CalendarDays, Users, DollarSign, Car, Info, PlayCircle, CheckCircle2, XCircle, Edit3, Clock, 
  AlertTriangle, MessageSquare, Trash2, Loader2, Navigation
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '@/lib/AuthContext'; // For accessing the token

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface DriverRideCardProps {
  ride: DriverOfferedRide;
  onUpdateRideLifecycleStatus: (rideId: string, action: 'START' | 'COMPLETE' | 'CANCEL_STATUS') => Promise<DriverOfferedRide | void>; // Return updated ride or void
  onConfirmBooking: (rideId: string, bookingId: string) => Promise<BookingDTO | void>;
  onRejectBooking: (rideId: string, bookingId: string) => Promise<BookingDTO | void>;
  onRideDeleted: (rideId: string) => void;
}

const getRideStatusProps = (status: DriverOfferedRide['status']): { 
  text: string; 
  Icon: React.ElementType; 
  colorClass: string; 
  badgeVariant: "default" | "destructive" | "secondary" | "outline" | "success" 
} => {
  switch (status) {
    case 'SCHEDULED':
      return { text: 'Scheduled', Icon: Clock, colorClass: 'text-blue-600 dark:text-blue-400', badgeVariant: 'default' };
    case 'ACTIVE':
      return { text: 'Active', Icon: Navigation, colorClass: 'text-orange-600 dark:text-orange-400', badgeVariant: 'secondary' }
    case 'IN_PROGRESS':
      return { text: 'In Progress', Icon: PlayCircle, colorClass: 'text-orange-600 dark:text-orange-400', badgeVariant: 'secondary' };
    case 'COMPLETED':
      return { text: 'Completed', Icon: CheckCircle2, colorClass: 'text-green-600 dark:text-green-400', badgeVariant: 'success' };
    case 'CANCELLED_BY_DRIVER':
      return { text: 'Cancelled by You', Icon: XCircle, colorClass: 'text-red-600 dark:text-red-400', badgeVariant: 'destructive' };
    case 'CANCELLED_SYSTEM':
      return { text: 'Cancelled (System)', Icon: AlertTriangle, colorClass: 'text-gray-500 dark:text-gray-400', badgeVariant: 'outline' };
    default:
      return { text: status, Icon: Info, colorClass: 'text-gray-500', badgeVariant: 'outline' };
  }
};

const cancelRideApi = async (rideId: string, token: string | null): Promise<void> => {
  if (!token) throw new Error("Authentication required to cancel ride.");

  const url = `${API_BASE_URL}/api/driver/delete-ride/${rideId}`;
  console.log(`API CALL: Cancelling (deleting) ride ${rideId} at ${url}`);

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    let errorMessage = `Failed to cancel ride. Status: ${response.status}`;
    try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
    } catch (e) {
        const textError = await response.text().catch(() => '');
        errorMessage = textError || errorMessage;
    }
    console.error("API Cancel/Delete Error:", errorMessage, response.status);
    throw new Error(errorMessage);
  }
  console.log(`Ride ${rideId} successfully cancelled/deleted (status ${response.status}).`);
};


const DriverRideCard = ({ 
  ride, 
  onUpdateRideLifecycleStatus, 
  onConfirmBooking, 
  onRejectBooking, 
  onRideDeleted
}: DriverRideCardProps) => {
  const { token } = useAuth();

  console.log(`DriverRideCard - Ride ID: ${ride.id}, Status: '${ride.status}'`); 

  const { text: statusText, Icon: StatusIcon, colorClass: statusColorClass, badgeVariant: statusBadgeVariant } = getRideStatusProps(ride.status);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [isBookingRequestsOpen, setIsBookingRequestsOpen] = useState(false);


  const handleRideLifecycleUpdate = async (action: 'START' | 'COMPLETE') => {
    const actionKey = `lifecycle_${action}_${ride.id}`;
    setProcessingAction(actionKey);
    try {
      await onUpdateRideLifecycleStatus(ride.id, action);
      toast.success(`Ride successfully ${action.toLowerCase()}ed!`);    
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action.toLowerCase()} ride.`);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleTrueCancelRide = async () => {
    if (!window.confirm(`Are you sure you want to permanently cancel and delete the ride from 
      ${ride.departureCity} to ${ride.destinationCity}? This action cannot be undone.`)) {
        return;
    }
    const actionKey = `delete_ride_${ride.id}`;
    setProcessingAction(actionKey);
    try {
        await cancelRideApi(ride.id, token);
        toast.success("Ride has been successfully cancelled and removed.");
        onRideDeleted(ride.id);
    } catch (error: any) {
        toast.error(error.message || "Failed to cancel ride. Please try again.");
    } finally {
        setProcessingAction(null);
    }
  };

  const handleConfirm = async (bookingId: string) => {
    const actionKey = `confirm_${bookingId}`
    setProcessingAction(actionKey);
    try {
        await onConfirmBooking(ride.id, bookingId);
        toast.success("Booking confirmed!");
    } catch (error: any) {
        toast.error(error.message || "Failed to confirm booking.");
    } finally {
        setProcessingAction(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    const actionKey = `reject_${bookingId}`;
    setProcessingAction(actionKey);
    try {
        await onRejectBooking(ride.id, bookingId);
        toast.info("Booking rejected.");
    } catch (error: any) {
        toast.error(error.message || "Failed to reject booking.");
    } finally {
        setProcessingAction(null);
    }
  };

  const canStart = ride.status === 'SCHEDULED';
  const canComplete = ride.status === 'ACTIVE';
  const canTrulyCancel = ride.status === 'SCHEDULED' || 'ACTIVE';
  const canEdit = ride.status === 'SCHEDULED';

  const pendingBookingRequests = ride.bookingRequests?.filter(
    req => req.status.toUpperCase().includes("PENDING")) || [];

  return (
    <Card className="w-full overflow-hidden shadow-lg flex flex-col bg-white dark:bg-gray-800">
      <CardHeader className="pb-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold text-primary flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-blue-600" />
              {ride.departureCity} to {ride.destinationCity}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground pt-1">
              {/* Ensure ride.createdAt is a valid date string if used with new Date() */}
              Offered: {ride.createdAt ? format(new Date(ride.createdAt), "MMM d, yyyy") : 'N/A'} | Ride ID: {ride.id}
            </CardDescription>
          </div>
          <Badge variant={statusBadgeVariant} className={`px-3 py-1.5 text-sm whitespace-nowrap ${statusColorClass} border ${statusColorClass.replace('text-', 'border-')}`}>
            <StatusIcon className="mr-1.5 h-4 w-4" />
            {statusText}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-4 flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-indigo-500" /> <strong>Departure:</strong> <span className="text-muted-foreground">{ride.departureTime ? format(new Date(ride.departureTime), "MMM d, h:mm a") : 'N/A'}</span></div>
            <div className="flex items-center"><Clock className="mr-2 h-4 w-4 text-indigo-500" /> <strong>Est. Arrival:</strong> <span className="text-muted-foreground">{ride.estimatedArrivalTime ? format(new Date(ride.estimatedArrivalTime), "MMM d, h:mm a") : 'N/A'}</span></div>
            <div className="flex items-center"><Users className="mr-2 h-4 w-4 text-orange-500" /> <strong>Seats:</strong> <span className="text-muted-foreground">{ride.confirmedBookingsCount || 0} Confirmed / {ride.totalSeats} Total ({ride.availableSeats} Avail.)</span></div>
            <div className="flex items-center"><DollarSign className="mr-2 h-4 w-4 text-green-500" /> <strong>Price:</strong> <span className="text-muted-foreground">${ride.pricePerSeat ? ride.pricePerSeat.toFixed(2) : '0.00'} / seat</span></div>
            {ride.vehicleDescription && <div className="flex items-center col-span-1 sm:col-span-2"><Car className="mr-2 h-4 w-4 text-gray-500" /> <strong>Vehicle:</strong> <span className="text-muted-foreground">{ride.vehicleDescription}</span></div>}
        </div>

        {ride.status === 'SCHEDULED' && ride.bookingRequests && ride.bookingRequests.length > 0 && (
          <Accordion type="single" collapsible className="w-full pt-2" value={isBookingRequestsOpen ? "booking-requests" : undefined} onValueChange={(value) => setIsBookingRequestsOpen(value === "booking-requests")}>
            <AccordionItem value="booking-requests" className="border-t dark:border-gray-700">
              <AccordionTrigger onClick={() => setIsBookingRequestsOpen(!isBookingRequestsOpen)} className="text-md font-semibold text-gray-700 dark:text-gray-200 hover:no-underline py-3">
                <div className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5 text-purple-500"/>
                    Booking Requests ({ride.bookingRequests.filter(req => req.status.includes("Peniding")).length} Pending)
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-0 space-y-2">
                {ride.bookingRequests.filter(req => req.status.includes("Peniding")).map(req => ( // Only show PENDING requests for action
                  <BookingRequestItem
                    key={req.bookingId}
                    request={req}
                    onConfirm={() => handleConfirm(req.bookingId)}
                    onReject={() => handleReject(req.bookingId)}
                    isProcessing={processingAction === `confirm_${req.bookingId}` || processingAction === `reject_${req.bookingId}`}
                  />
                ))}
                 {ride.bookingRequests.filter(req => req.status.includes("Peniding")).length === 0 && (
                    <p className="text-sm text-muted-foreground italic px-3 py-2">No pending requests requiring action.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
         {ride.status === 'SCHEDULED' && (!ride.bookingRequests || ride.bookingRequests.filter(req => req.status .includes("Peniding")).length === 0) && (
             <p className="text-sm text-muted-foreground pt-2 italic">No pending booking requests for this ride.</p>
         )}
      </CardContent>

      <CardFooter className="p-4 md:p-6 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-end gap-2 w-full">
          {canEdit && (
            <Link href={`/driver/my-rides/${ride.id}/edit`} passHref legacyBehavior>
              <Button variant="outline" size="sm" disabled={!!processingAction}>
                <Edit3 className="mr-1.5 h-4 w-4" /> Edit Details
              </Button>
            </Link>
          )}
          {canStart && (
            <Button 
              variant="default" 
              size="sm" 
              className="bg-green-600 hover:bg-green-700" 
              onClick={() => handleRideLifecycleUpdate('START')} 
              disabled={!!processingAction || processingAction === `lifecycle_START_${ride.id}`}>
              {processingAction === `lifecycle_START_${ride.id}` && 
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> }
              <PlayCircle className="mr-1.5 h-4 w-4" 
            /> 
            Start Ride
            </Button>
          )}
          {canComplete && (
            <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleRideLifecycleUpdate('COMPLETE')} disabled={!!processingAction || processingAction === `lifecycle_COMPLETE_${ride.id}`}>
              {processingAction === `lifecycle_COMPLETE_${ride.id}` && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Complete Ride
            </Button>
          )}
          {canTrulyCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleTrueCancelRide}
              disabled={!!processingAction || processingAction === `delete_ride_${ride.id}`}>
               {processingAction === `delete_ride_${ride.id}` && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              <Trash2 className="mr-1.5 h-4 w-4" /> Cancel Ride
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default DriverRideCard;
