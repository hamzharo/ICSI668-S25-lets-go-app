// frontend/components/driver/DriverRideCard.tsx
'use client';

import React, { useState } from 'react';
import { DriverOfferedRide, BookingRequestSummary } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from 'next/link'; // For Edit button
import BookingRequestItem from './BookingRequestItem';
import {
  MapPin, CalendarDays, Users, DollarSign, Car, Info, PlayCircle, CheckCircle2, XCircle, Edit3, Clock, AlertTriangle, MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

interface DriverRideCardProps {
  ride: DriverOfferedRide;
  onUpdateStatus: (rideId: string, newStatus: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED_BY_DRIVER') => Promise<void>;
  onConfirmBooking: (rideId: string, bookingId: string) => Promise<void>;
  onRejectBooking: (rideId: string, bookingId: string) => Promise<void>;
  // onEditRide: (ride: DriverOfferedRide) => void; // For opening an edit modal/page
}

const getRideStatusProps = (status: DriverOfferedRide['status']): { text: string; Icon: React.ElementType; colorClass: string; badgeVariant: "default" | "destructive" | "secondary" | "outline" | "success" } => {
  switch (status) {
    case 'SCHEDULED':
      return { text: 'Scheduled', Icon: Clock, colorClass: 'text-blue-600 dark:text-blue-400', badgeVariant: 'default' };
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

const DriverRideCard = ({ ride, onUpdateStatus, onConfirmBooking, onRejectBooking }: DriverRideCardProps) => {
  const { text: statusText, Icon: StatusIcon, colorClass: statusColorClass, badgeVariant: statusBadgeVariant } = getRideStatusProps(ride.status);
  const [processingAction, setProcessingAction] = useState<string | null>(null); // e.g., 'start', 'complete', 'cancel', 'booking_confirm_bookingId', 'booking_reject_bookingId'
  const [isBookingRequestsOpen, setIsBookingRequestsOpen] = useState(false);


  const handleRideStatusUpdate = async (newStatus: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED_BY_DRIVER') => {
    const actionKey = `status_${newStatus}`;
    setProcessingAction(actionKey);
    try {
      await onUpdateStatus(ride.id, newStatus);
      toast.success(`Ride status updated to ${newStatus.replace('_', ' ').toLowerCase()}!`);
      // Parent page will refetch/update state
    } catch (error: any) {
      toast.error(error.message || `Failed to update ride status.`);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleConfirm = async (bookingId: string) => {
    setProcessingAction(`confirm_${bookingId}`);
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
    setProcessingAction(`reject_${bookingId}`);
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
  const canComplete = ride.status === 'IN_PROGRESS';
  const canCancel = ride.status === 'SCHEDULED' || ride.status === 'IN_PROGRESS'; // Define cancellation rules
  const canEdit = ride.status === 'SCHEDULED';

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
              Offered: {format(new Date(ride.createdAt), "MMM d, yyyy")} | Ride ID: {ride.id}
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
            <div className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-indigo-500" /> <strong>Departure:</strong> <span className="text-muted-foreground">{format(new Date(ride.departureTime), "MMM d, h:mm a")}</span></div>
            <div className="flex items-center"><Clock className="mr-2 h-4 w-4 text-indigo-500" /> <strong>Est. Arrival:</strong> <span className="text-muted-foreground">{format(new Date(ride.estimatedArrivalTime), "MMM d, h:mm a")}</span></div>
            <div className="flex items-center"><Users className="mr-2 h-4 w-4 text-orange-500" /> <strong>Seats:</strong> <span className="text-muted-foreground">{ride.confirmedBookingsCount || 0} Confirmed / {ride.totalSeats} Total ({ride.availableSeats} Avail.)</span></div>
            <div className="flex items-center"><DollarSign className="mr-2 h-4 w-4 text-green-500" /> <strong>Price:</strong> <span className="text-muted-foreground">${ride.pricePerSeat.toFixed(2)} / seat</span></div>
            {ride.vehicleDescription && <div className="flex items-center col-span-1 sm:col-span-2"><Car className="mr-2 h-4 w-4 text-gray-500" /> <strong>Vehicle:</strong> <span className="text-muted-foreground">{ride.vehicleDescription}</span></div>}
        </div>

        {/* Booking Requests Section - only if ride is SCHEDULED and has requests */}
        {ride.status === 'SCHEDULED' && ride.bookingRequests && ride.bookingRequests.length > 0 && (
          <Accordion type="single" collapsible className="w-full pt-2" value={isBookingRequestsOpen ? "booking-requests" : undefined} onValueChange={(value) => setIsBookingRequestsOpen(value === "booking-requests")}>
            <AccordionItem value="booking-requests" className="border-t dark:border-gray-700">
              <AccordionTrigger onClick={() => setIsBookingRequestsOpen(!isBookingRequestsOpen)} className="text-md font-semibold text-gray-700 dark:text-gray-200 hover:no-underline py-3">
                <div className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5 text-purple-500"/>
                    Booking Requests ({ride.bookingRequests.length} Pending)
                    {/* You could add a small pulsing dot here if new/unread requests */}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-0 space-y-2">
                {ride.bookingRequests.map(req => (
                  <BookingRequestItem
                    key={req.bookingId}
                    request={req}
                    onConfirm={() => handleConfirm(req.bookingId)}
                    onReject={() => handleReject(req.bookingId)}
                    isProcessing={processingAction === `confirm_${req.bookingId}` || processingAction === `reject_${req.bookingId}`}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
         {ride.status === 'SCHEDULED' && (!ride.bookingRequests || ride.bookingRequests.length === 0) && (
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
            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleRideStatusUpdate('IN_PROGRESS')} disabled={!!processingAction || processingAction === 'status_IN_PROGRESS'}>
              {processingAction === 'status_IN_PROGRESS' && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              <PlayCircle className="mr-1.5 h-4 w-4" /> Start Ride
            </Button>
          )}
          {canComplete && (
            <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleRideStatusUpdate('COMPLETED')} disabled={!!processingAction || processingAction === 'status_COMPLETED'}>
              {processingAction === 'status_COMPLETED' && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Complete Ride
            </Button>
          )}
          {canCancel && (
            <Button variant="destructive" size="sm" onClick={() => {
                if (window.confirm("Are you sure you want to cancel this ride? This may affect passengers who have already booked.")) {
                    handleRideStatusUpdate('CANCELLED_BY_DRIVER');
                }
            }} disabled={!!processingAction || processingAction === 'status_CANCELLED_BY_DRIVER'}>
               {processingAction === 'status_CANCELLED_BY_DRIVER' && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              <XCircle className="mr-1.5 h-4 w-4" /> Cancel Ride
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default DriverRideCard;