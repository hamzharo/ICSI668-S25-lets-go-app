// frontend/components/driver/BookingRequestItem.tsx
'use client';

import React from 'react';
import { BookingRequestSummary } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, User, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BookingRequestItemProps {
  request: BookingRequestSummary;
  onConfirm: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
  isProcessing: boolean; // True if confirm/reject for this item is in progress
}

const BookingRequestItem = ({ request, onConfirm, onReject, isProcessing }: BookingRequestItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={request.passengerProfilePictureUrl || undefined} alt={`${request.passengerFirstName}'s avatar`} />
          <AvatarFallback>
            {request.passengerFirstName?.[0]?.toUpperCase()}
            {request.passengerLastName?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {request.passengerFirstName} {request.passengerLastName || ''}
          </p>
          <p className="text-xs text-muted-foreground flex items-center">
            <Users className="mr-1 h-3 w-3" /> Requested {request.seatsRequested} seat(s)
            <span className="mx-1">·</span>
            {formatDistanceToNow(new Date(request.requestTime), { addSuffix: true })}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-600 dark:text-red-500 dark:hover:bg-red-700/20 dark:hover:text-red-400"
          onClick={() => onReject(request.bookingId)}
          disabled={isProcessing}
          aria-label="Reject booking request"
        >
          <X className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Reject</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 dark:border-green-600 dark:text-green-500 dark:hover:bg-green-700/20 dark:hover:text-green-400"
          onClick={() => onConfirm(request.bookingId)}
          disabled={isProcessing}
          aria-label="Confirm booking request"
        >
          <Check className="h-4 w-4" />
           <span className="ml-1 hidden sm:inline">Confirm</span>
        </Button>
      </div>
    </div>
  );
};

export default BookingRequestItem;