// frontend/components/rides/RideCard.tsx
'use client';

import { RideSearchResult } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, MapPin, Users, DollarSign, Clock, Loader2, Car } from 'lucide-react'; // Added Loader2 and Car
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';

interface RideCardProps {
  ride: RideSearchResult;
  onBookRide: (rideId: string) => void; // Callback to initiate booking modal
  isPassenger: boolean; // To enable/disable booking button
  isBookingRideId: string | null; // To show loading state on this specific card's button
}

const RideCard = ({ ride, onBookRide, isPassenger, isBookingRideId }: RideCardProps) => {
  const formatDateTime = (isoString: string | undefined) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch (e) {
      console.error("Error formatting date:", isoString, e);
      return 'Invalid Date';
    }
  };

  const isCurrentlyBookingThisRide = isBookingRideId === ride.id;
  // Ride is bookable if it's scheduled and has available seats
  const canBookRide = ride.status === 'SCHEDULED' && ride.availableSeats > 0;

  // Determine driver display string based on available info
  // Prioritize FirstName LastName (ID) if available, fallback to just ID or 'N/A'
  let driverDisplay = `Driver: ${ride.driverId || 'N/A'}`;
  if (ride.driverFirstName) {
    driverDisplay = `Driver: ${ride.driverFirstName}${ride.driverLastName ? ` ${ride.driverLastName?.[0]?.toUpperCase()}.` : ''} (${ride.driverId || 'ID missing'})`;
  }
  // If you strictly want to match the image which only shows ID:
  // const driverDisplay = `Driver: ${ride.driverId || 'N/A'}`;


  return (
    <Card className="w-full flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold">
            {ride.departureCity} to {ride.destinationCity}
          </CardTitle>
          <Badge variant={ride.status === 'SCHEDULED' ? 'default' : 'secondary'}>
            {ride.status ? ride.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
          </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          {driverDisplay}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          <span>From: <strong>{ride.departureCity}, {ride.departureState}</strong></span>
        </div>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          <span>To: <strong>{ride.destinationCity}, {ride.destinationState}</strong></span>
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
          <span>Price: <strong>$ {(ride.pricePerSeat ?? 0).toFixed(2)} / seat</strong></span>
        </div>
        {ride.vehicleDescription && (
            <div className="flex items-center text-xs text-muted-foreground pt-1">
                <Car className="h-3 w-3 mr-1.5" /> {/* Added Car icon */}
                <span>Vehicle: {ride.vehicleDescription}</span>
            </div>
        )}
      </CardContent>
      <CardFooter className="pt-3">
        {isPassenger ? (
          <Button
            onClick={() => onBookRide(ride.id)}
            disabled={!canBookRide || isCurrentlyBookingThisRide}
            className="w-full"
            aria-label={`Request ride from ${ride.departureCity} to ${ride.destinationCity}`}
          >
            {isCurrentlyBookingThisRide ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : !canBookRide ? (ride.availableSeats === 0 ? 'No Seats Left' : 'Booking Closed') : 'Request Ride'}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground w-full text-center">Log in as a passenger to book.</p>
        )}
      </CardFooter>
    </Card>
  );
};

export default RideCard;