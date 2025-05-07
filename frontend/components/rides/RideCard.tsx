// frontend/components/rides/RideCard.tsx
'use client';

import React from 'react';
import { RideSearchResult } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { MapPin, CalendarDays, Clock, Users, Car, UserCircle, DollarSign, ArrowRight, Info } from 'lucide-react';
import { format } from 'date-fns'; // npm install date-fns

interface RideCardProps {
  ride: RideSearchResult;
  // onBookRequest?: (rideId: string) => void; // Optional: If booking directly from card
}

const RideCard = ({ ride }: RideCardProps) => {
  const formattedDepartureTime = format(new Date(ride.departureTime), "eee, MMM d, yyyy 'at' h:mm a");
  // const formattedArrivalTime = format(new Date(ride.estimatedArrivalTime), "h:mm a"); // If needed

  return (
    <Card className="w-full overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="pb-3 bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700">
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-xl md:text-2xl font-semibold text-primary flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                    {ride.departureCity} to {ride.destinationCity}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground pt-1">
                    Offered by: {ride.driverFirstName} {ride.driverLastName?.[0] || ''}.
                    {/* <UserCircle className="inline ml-1 h-4 w-4" /> */}
                </CardDescription>
            </div>
            <div className="text-right">
                <p className="text-xl font-bold text-green-600 flex items-center">
                    <DollarSign className="h-5 w-5 mr-1"/>
                    {ride.pricePerSeat.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">per seat</p>
            </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-4 flex-grow">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-2 h-4 w-4 text-indigo-500" />
          <span className="font-medium text-gray-700 dark:text-gray-300">Departure:</span> {formattedDepartureTime}
        </div>

        {/* Optional: Arrival Time
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4 text-indigo-500" />
          <span className="font-medium text-gray-700 dark:text-gray-300">Est. Arrival:</span> {formattedArrivalTime}
        </div>
        */}

        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4 text-orange-500" />
          <span className="font-medium text-gray-700 dark:text-gray-300">Seats Available:</span> {ride.availableSeats}
        </div>

        {ride.vehicleDescription && (
            <div className="flex items-center text-sm text-muted-foreground">
                <Car className="mr-2 h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Vehicle:</span> {ride.vehicleDescription}
            </div>
        )}
         {/* Ride Status (useful if searching for rides that might be starting soon) */}
        {/* <div className="flex items-center text-sm text-muted-foreground">
            <Info className="mr-2 h-4 w-4 text-teal-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span> 
            <span className={`capitalize font-semibold ${ride.status === 'SCHEDULED' ? 'text-green-600' : 'text-yellow-600'}`}>
                {ride.status.toLowerCase().replace('_', ' ')}
            </span>
        </div> */}

      </CardContent>

      <CardFooter className="p-4 md:p-6 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700">
        {/*
          The link should go to a specific ride details page.
          Example: /rides/[rideId]
          You will need to create this dynamic route page later.
        */}
        <Link href={`/rides/${ride.id}`} passHref legacyBehavior className="w-full">
          <Button size="lg" variant="default" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            View Details & Book <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        {/* Alternative: Direct booking request from card if UX allows
        {onBookRequest && ride.availableSeats > 0 && (
          <Button size="lg" onClick={() => onBookRequest(ride.id)} className="w-full">
            Request to Book
          </Button>
        )}
        */}
      </CardFooter>
    </Card>
  );
};

export default RideCard;