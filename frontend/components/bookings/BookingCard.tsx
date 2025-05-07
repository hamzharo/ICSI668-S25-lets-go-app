// frontend/components/bookings/BookingCard.tsx
'use client';

import React from 'react';
import { PassengerBooking, BookingStatus } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { MapPin, CalendarDays, Users, DollarSign, Info, XCircle, CheckCircle, Hourglass, Ban, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface BookingCardProps {
  booking: PassengerBooking;
  onCancelBooking: (bookingId: string) => Promise<void>;
  isCancelling: boolean; // To disable button during cancellation
}

const getStatusProps = (status: BookingStatus): { text: string; Icon: React.ElementType; colorClass: string; badgeVariant: "default" | "destructive" | "secondary" | "outline" | "success" } => {
  switch (status) {
    case 'REQUESTED':
      return { text: 'Pending Confirmation', Icon: Hourglass, colorClass: 'text-yellow-600 dark:text-yellow-400', badgeVariant: 'secondary' };
    case 'CONFIRMED':
      return { text: 'Confirmed', Icon: CheckCircle, colorClass: 'text-green-600 dark:text-green-400', badgeVariant: 'success' };
    case 'REJECTED_BY_DRIVER':
      return { text: 'Rejected by Driver', Icon: XCircle, colorClass: 'text-red-600 dark:text-red-400', badgeVariant: 'destructive' };
    case 'CANCELLED_BY_PASSENGER':
      return { text: 'You Cancelled', Icon: Ban, colorClass: 'text-gray-500 dark:text-gray-400', badgeVariant: 'outline' };
    case 'CANCELLED_BY_DRIVER':
      return { text: 'Cancelled by Driver', Icon: Ban, colorClass: 'text-red-600 dark:text-red-400', badgeVariant: 'destructive' };
    case 'COMPLETED':
      return { text: 'Completed', Icon: CheckCircle, colorClass: 'text-blue-600 dark:text-blue-400', badgeVariant: 'default' };
    default:
      return { text: status.replace('_', ' ').toLowerCase(), Icon: Info, colorClass: 'text-gray-500', badgeVariant: 'outline' };
  }
};


const BookingCard = ({ booking, onCancelBooking, isCancelling }: BookingCardProps) => {
  const { text: statusText, Icon: StatusIcon, colorClass: statusColorClass, badgeVariant: statusBadgeVariant } = getStatusProps(booking.status);

  const canCancel = booking.status === 'REQUESTED' || booking.status === 'CONFIRMED'; // Add other cancellable statuses if any
  const totalCost = (booking.rideDetails.pricePerSeat && booking.seatsBooked)
    ? (booking.rideDetails.pricePerSeat * booking.seatsBooked).toFixed(2)
    : 'N/A';


  return (
    <Card className="w-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader className="pb-3 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="mb-2 sm:mb-0">
            <CardTitle className="text-lg md:text-xl font-semibold text-primary flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-blue-500" />
              {booking.rideDetails.departureCity} to {booking.rideDetails.destinationCity}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground pt-1">
              Booked on: {format(new Date(booking.bookingDate), "MMM d, yyyy")} | Ride ID: {booking.rideId}
            </CardDescription>
          </div>
          <Badge variant={statusBadgeVariant} className={`px-3 py-1 text-sm ${statusColorClass} border ${statusColorClass.replace('text-', 'border-')}`}>
            <StatusIcon className="mr-1.5 h-4 w-4" />
            {statusText}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-5 space-y-3 flex-grow">
        <div className="flex items-center text-sm">
          <CalendarDays className="mr-2 h-4 w-4 text-indigo-500" />
          <span className="font-medium text-gray-700 dark:text-gray-300">Departure:</span> 
          <span className="text-muted-foreground">{format(new Date(booking.rideDetails.departureTime), "eee, MMM d, yyyy 'at' h:mm a")}</span>
        </div>
        <div className="flex items-center text-sm">
          <Users className="mr-2 h-4 w-4 text-orange-500" />
          <span className="font-medium text-gray-700 dark:text-gray-300">Seats Booked:</span> 
          <span className="text-muted-foreground">{booking.seatsBooked}</span>
        </div>
        {booking.rideDetails.pricePerSeat && (
            <div className="flex items-center text-sm">
                <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Total Cost:</span> 
                <span className="text-muted-foreground">${totalCost}</span>
            </div>
        )}
      </CardContent>

      <CardFooter className="p-4 md:p-5 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link href={`/rides/${booking.rideId}`} passHref legacyBehavior>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            View Ride Details <ArrowRight className="ml-2 h-4 w-4" />
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
            <XCircle className="mr-2 h-4 w-4" /> Cancel Booking
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BookingCard;