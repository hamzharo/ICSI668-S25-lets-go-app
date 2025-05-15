// frontend/components/bookings/BookingCard.tsx
'use client';

import React from 'react';
import { PassengerBooking, BookingStatus } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { MapPin, CalendarDays, Users, DollarSign, Info, Hourglass, CheckCircle, XCircle, Ban, ArrowRight } from 'lucide-react';
import { format, isValid } from 'date-fns';
// Badge import can be removed if getStatusProps is not used for badges anymore, or if status is not shown visually with Badge.
// import { Badge } from '@/components/ui/badge'; // Only needed if getStatusProps is used to render a Badge

interface BookingCardProps {
  booking: PassengerBooking;
  onCancelBooking: (bookingId: string) => Promise<void>;
  isCancelling: boolean;
}

// getStatusProps is still used for the CardContent when rideData is not loaded.
const getStatusProps = (status: BookingStatus): { text: string; Icon: React.ElementType; colorClass: string; /* badgeVariant could be removed if not used for a Badge component */ badgeVariant: "default" | "destructive" | "secondary" | "outline" | "success" } => {
  switch (status) {
    case 'REQUESTED':
      return { text: 'Pending', Icon: Hourglass, colorClass: 'text-yellow-600 dark:text-yellow-400', badgeVariant: 'secondary' };
    case 'CONFIRMED':
      return { text: 'Confirmed', Icon: CheckCircle, colorClass: 'text-green-600 dark:text-green-400', badgeVariant: 'success' };
    case 'REJECTED_BY_DRIVER':
      return { text: 'Rejected', Icon: XCircle, colorClass: 'text-red-600 dark:text-red-400', badgeVariant: 'destructive' };
    case 'CANCELLED_BY_PASSENGER':
      return { text: 'Cancelled', Icon: Ban, colorClass: 'text-gray-500 dark:text-gray-400', badgeVariant: 'outline' };
    case 'CANCELLED_BY_DRIVER':
      return { text: 'Driver Cancelled', Icon: Ban, colorClass: 'text-red-600 dark:text-red-400', badgeVariant: 'destructive' };
    case 'COMPLETED':
      return { text: 'Completed', Icon: CheckCircle, colorClass: 'text-blue-600 dark:text-blue-400', badgeVariant: 'default' };
    default:
      const defaultText = typeof status === 'string' ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Status';
      return { text: defaultText, Icon: Info, colorClass: 'text-gray-500', badgeVariant: 'outline' };
  }
};

const BookingCard = ({ booking, onCancelBooking, isCancelling }: BookingCardProps) => {
  const canCancel = booking.status === 'REQUESTED' || booking.status === 'CONFIRMED';
  const rideData = booking.rideDetails; // This will be undefined if API call for ride details fails or is pending
  console.log("ride data in booking card is: ", rideData);
  
  const totalCost = (rideData?.farePerSeat != null && booking.seatsBooked)
    ? (rideData.farePerSeat * booking.seatsBooked).toFixed(2)
    : 'N/A';

  const formatDateSafe = (dateString: string | undefined, formatString: string = "eee, MMM d, yyyy 'at' h:mm a") => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isValid(date) ? format(date, formatString) : 'Invalid Date';
  };

  const formatBookingDateSafe = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isValid(date) ? format(date, "MMM d, yyyy") : 'Invalid Date';
  };

  // Get properties for the status to be shown in CardContent when rideData is not loaded
  const contentStatusProps = getStatusProps(booking.status);

  return (
    <Card className="w-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader className="pb-3 pt-4 px-4 md:px-5 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700">
        <div className="flex items-start gap-2"> {/* No justify-between needed as badge is removed */}
          {/* Top Left: From City - To City & Booking Date */}
          <div className="flex-grow min-w-0">
            <CardTitle className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center truncate">
              <MapPin className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0" />
              <span className="truncate">
                {rideData ? (
                  `${rideData.departureCity} - ${rideData.destinationCity}`
                ) : (
                  '/' // Shows "/" if rideData is undefined (loading or failed fetch)
                )}
              </span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Booked: {formatBookingDateSafe(booking.bookingTime)}
              {/* Booking ID removed from here */}
            </CardDescription>
          </div>
          {/* Status Badge was removed from the top right of CardHeader */}
        </div>
      </CardHeader>

      {/* Middle Section: Ride Specifics or Booking Status if rideData not loaded */}
      <CardContent className={`p-4 md:p-5 flex-grow ${rideData ? 'space-y-2.5' : 'flex flex-col items-center justify-center min-h-[80px]'}`}>
        {rideData ? (
          <>
            <div className="flex items-center text-sm">
              <CalendarDays className="mr-2 h-4 w-4 text-indigo-500 flex-shrink-0" />
              <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">Departure:</span>
              <span className="text-muted-foreground truncate">{formatDateSafe(rideData.departureTime)}</span>
            </div>
            <div className="flex items-center text-sm">
              <Users className="mr-2 h-4 w-4 text-orange-500 flex-shrink-0" />
              <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">Seats:</span>
              <span className="text-muted-foreground">{booking.seatsBooked}</span>
            </div>
            {rideData.farePerSeat != null && (
                <div className="flex items-center text-sm">
                    <DollarSign className="mr-2 h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">Total:</span>
                    <span className="text-muted-foreground">${totalCost}</span>
                </div>
            )}
          </>
        ) : (
          // Display Booking Status here if rideData is not loaded
          <div className="flex flex-col items-center text-center">
            <contentStatusProps.Icon className={`h-6 w-6 mb-1 ${contentStatusProps.colorClass}`} />
            <span className={`text-sm font-medium ${contentStatusProps.colorClass}`}>{contentStatusProps.text}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Awaiting ride details...</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 md:p-5 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link href={`/rides/${booking.rideId}`} passHref legacyBehavior>
          <Button variant="default" size="sm" className="w-full sm:w-auto" disabled={isCancelling}>
            View Ride Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        {canCancel && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onCancelBooking(booking.bookingId)}
            disabled={isCancelling}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BookingCard;