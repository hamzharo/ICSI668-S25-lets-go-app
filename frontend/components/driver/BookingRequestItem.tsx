// frontend/components/driver/BookingRequestItem.tsx
'use client';

import React from 'react';
import { BookingRequestSummary } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, Check, X, Clock, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BookingRequestItemProps {
  request: BookingRequestSummary;
  onConfirm: () => void; // Simpler: just call the function, ID is in `request`
  onReject: () => void;  // Simpler: just call the function, ID is in `request`
  isProcessingConfirm: boolean; // Specific loading state for confirm
  isProcessingReject: boolean;  // Specific loading state for reject
}

const BookingRequestItem = ({
  request,
  onConfirm,
  onReject,
  isProcessingConfirm,
  isProcessingReject
}: BookingRequestItemProps) => {
  return (
    <div className="p-3 border rounded-md bg-slate-50 dark:bg-slate-700/50 hover:shadow-md transition-shadow duration-150">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={request.passengerInfo.firstName || undefined} alt={request.passengerInfo.firstName} />
            <AvatarFallback>
              {request.passengerInfo.firstName?.charAt(0).toUpperCase()}
              {request.passengerInfo.lastName?.charAt(0).toUpperCase()}
              {!request.passengerInfo.firstName && <UserCircle className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {request.passengerInfo.firstName} {request.passengerInfo.lastName || ''}
            </p>
            <p className="text-xs text-muted-foreground">
              Requested {request.seatsRequested} seat(s)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0 self-end sm:self-center">
          {request.status.includes("PENDING") && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-700/20 px-2.5"
                onClick={onReject}
                disabled={isProcessingReject || isProcessingConfirm}
              >
                {isProcessingReject ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                <span className="ml-1.5 hidden xs:inline">Reject</span>
              </Button>
              <Button
                size="sm"
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white px-2.5"
                onClick={onConfirm}
                disabled={isProcessingConfirm || isProcessingReject}
              >
                {isProcessingConfirm ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span className="ml-1.5 hidden xs:inline">Confirm</span>
              </Button>
            </>
          )}
          {request.status === 'CONFIRMED' && (
            <span className="text-xs font-semibold text-green-600 inline-flex items-center py-1 px-2 rounded-md bg-green-100 dark:bg-green-700/30">
              <Check className="h-4 w-4 mr-1" /> Confirmed
            </span>
          )}
          {request.status === 'REJECTED' && (
            <span className="text-xs font-semibold text-red-600 inline-flex items-center py-1 px-2 rounded-md bg-red-100 dark:bg-red-700/30">
              <X className="h-4 w-4 mr-1" /> Rejected
            </span>
          )}
           {/* Add other statuses like CANCELLED_BY_PASSENGER if needed */}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1.5 flex items-center">
        <Clock className="h-3 w-3 mr-1" />
        Requested {formatDistanceToNow(new Date(request.requestTime), { addSuffix: true })}
      </p>
    </div>
  );
};

export default BookingRequestItem;