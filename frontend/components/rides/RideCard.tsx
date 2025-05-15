// frontend/components/rides/RideCard.tsx (Example)
'use client';

import { RideSearchResult } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, MapPin, Users, DollarSign, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button'; // Assuming you have a Button component
// import Link from 'next/link'; // If you want to link to a ride detail page

interface RideCardProps {
  ride: RideSearchResult;
  // onBook?: (rideId: string) => void; // Example for a booking action
}

const RideCard = ({ ride }: RideCardProps) => {
  const formatDateTime = (isoString: string) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <Card className="w-full flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold">
            {ride.departureCity} to {ride.destinationCity}
          </CardTitle>
          <Badge variant={ride.status === 'SCHEDULED' ? 'default' : 'secondary'}>
            {ride.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          Driver: {ride.driverFirstName} {ride.driverLastName?.[0]?.toUpperCase() || ''} {ride.driverId}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          <span>From: <strong>{ride.departureCity}, {ride.departureState}</strong></span> {/* DISPLAYING STATE */}
        </div>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          <span>To: <strong>{ride.destinationCity}, {ride.destinationState}</strong></span> {/* DISPLAYING STATE */}
        </div>
        <div className="flex items-center">
          <CalendarDays className="h-4 w-4 mr-2 text-primary" />
          <span>Departs: <strong>{formatDateTime(ride.departureTime)}</strong></span>
        </div>
        {ride.estimatedArrivalTime && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            <span>Est. Arrival: <strong>{formatDateTime(ride.estimatedArrivalTime)}</strong></span>
          </div>
        )}
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-2 text-primary" />
          <span>Seats Available: <strong>{ride.availableSeats}</strong></span>
        </div>
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 mr-2 text-primary" />
          <span>Price: <strong>$ {ride?.farePerSeat?.toFixed(2)} / seat</strong></span>
        </div>
        {ride.vehicleDescription && (
            <p className="text-xs text-muted-foreground pt-1">Vehicle: {ride.vehicleDescription}</p>
        )}
      </CardContent>
      <CardFooter className="pt-3">
        {/* Example: Link to a ride detail page or a booking button */}
        {/* <Link href={`/rides/${ride.id}`} passHref>
          <Button variant="outline" className="w-full">View Details</Button>
        </Link> */}
        {/* Or if you have a direct booking action:
        {onBook && ride.status === 'SCHEDULED' && ride.availableSeats > 0 && (
            <Button onClick={() => onBook(ride.id)} className="w-full">Book Seat</Button>
        )}
        */}
      </CardFooter>
    </Card>
  );
};

export default RideCard;