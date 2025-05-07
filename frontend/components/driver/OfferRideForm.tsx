// frontend/components/driver/OfferRideForm.tsx
'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // For rideNotes
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RideCreationFormValues, RideCreationDTO } from '@/types';
import { Loader2, Car, PlusCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

// Zod schema for form validation
const offerRideSchema = z.object({
  departureCity: z.string().min(2, "Departure city must be at least 2 characters."),
  destinationCity: z.string().min(2, "Destination city must be at least 2 characters."),
  departureTime: z.string().min(1, "Departure date & time is required."), // Validate it's a future date/time
  estimatedArrivalTime: z.string().min(1, "Estimated arrival date & time is required."), // Validate it's after departure
  availableSeats: z.coerce.number().min(1, "At least 1 seat must be available.").max(10, "Maximum 10 seats."),
  pricePerSeat: z.coerce.number().min(0, "Price cannot be negative.").max(500, "Price seems too high."), // Min can be 0 for free rides
  vehicleDescription: z.string().min(5, "Vehicle description is required (e.g., Toyota Camry, Blue).").max(100),
  rideNotes: z.string().max(250, "Notes cannot exceed 250 characters.").optional(),
}).refine(data => new Date(data.estimatedArrivalTime) > new Date(data.departureTime), {
  message: "Estimated arrival time must be after departure time.",
  path: ["estimatedArrivalTime"],
}).refine(data => new Date(data.departureTime) > new Date(Date.now() - 60000), { // Allow a minute of buffer for submission
    message: "Departure time must be in the future.",
    path: ["departureTime"],
});


interface OfferRideFormProps {
  // Props if needed, e.g., for pre-filling or specific context
}

// --- TODO: Replace with actual API service call ---
const createRideOfferApi = async (rideData: RideCreationDTO, token: string | null): Promise<any> => { // Define a proper response type
  if (!token) throw new Error("Authentication required.");
  console.log("API CALL: Creating ride offer with data:", rideData);
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/driver/rides`, { // Or /api/rides/offer-ride
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${token}`,
  //   },
  //   body: JSON.stringify(rideData),
  // });

  // if (!response.ok) {
  //   const errorResult = await response.json().catch(() => ({ message: "Failed to create ride offer." }));
  //   throw new Error(errorResult.message || "An unexpected error occurred.");
  // }
  // return response.json(); // Or just a success message/status

  // Mock API response:
  return new Promise(resolve => setTimeout(() => {
    resolve({ success: true, message: "Ride offer created successfully!", rideId: `mock_ride_${Date.now()}` });
  }, 1500));
};
// --- End TODO ---


const OfferRideForm = ({}: OfferRideFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  const form = useForm<RideCreationFormValues>({
    resolver: zodResolver(offerRideSchema),
    defaultValues: {
      departureCity: '',
      destinationCity: '',
      departureTime: '',
      estimatedArrivalTime: '',
      availableSeats: 1,
      pricePerSeat: 10, // Default price
      vehicleDescription: '',
      rideNotes: '',
    },
  });

  // Set default departure/arrival times to reasonable future values
  React.useEffect(() => {
    const now = new Date();
    const defaultDeparture = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    const defaultArrival = new Date(defaultDeparture.getTime() + 3 * 60 * 60 * 1000); // 3 hours after departure

    form.setValue('departureTime', defaultDeparture.toISOString().slice(0, 16));
    form.setValue('estimatedArrivalTime', defaultArrival.toISOString().slice(0, 16));
  }, [form]);

  const onSubmit: SubmitHandler<RideCreationFormValues> = async (data) => {
    setIsLoading(true);

    // Convert datetime-local strings to ISO 8601 strings for the backend
    const rideDataDTO: RideCreationDTO = {
      ...data,
      departureTime: new Date(data.departureTime).toISOString(),
      estimatedArrivalTime: new Date(data.estimatedArrivalTime).toISOString(),
      // Ensure numbers are numbers if coerce didn't fully handle for API
      availableSeats: Number(data.availableSeats),
      pricePerSeat: Number(data.pricePerSeat),
    };

    try {
      const result = await createRideOfferApi(rideDataDTO, token);
      toast.success(result.message || "Ride offer created successfully!");
      form.reset(); // Reset form after successful submission
      // Optionally, redirect to "My Offered Rides" or the newly created ride's detail page
      router.push('/driver/my-rides'); // Redirect to list of offered rides
    } catch (error: any) {
      toast.error(error.message || "Failed to create ride offer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-bold flex items-center">
          <Car className="mr-3 h-8 w-8 text-primary" /> Offer a New Ride
        </CardTitle>
        <CardDescription>
          Fill in the details below to share your upcoming trip with passengers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="departureCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure City</FormLabel>
                    <FormControl><Input placeholder="E.g., Los Angeles" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destinationCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination City</FormLabel>
                    <FormControl><Input placeholder="E.g., San Francisco" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="departureTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Date & Time</FormLabel>
                    <FormControl><Input type="datetime-local" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedArrivalTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Arrival Date & Time</FormLabel>
                    <FormControl><Input type="datetime-local" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="availableSeats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Seats</FormLabel>
                    <FormControl><Input type="number" min="1" placeholder="E.g., 3" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pricePerSeat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Per Seat ($)</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0" placeholder="E.g., 25.50" {...field} /></FormControl>
                    <FormDescription>Enter 0 for a free ride.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="vehicleDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Description</FormLabel>
                  <FormControl><Input placeholder="E.g., Toyota Prius, Silver, 2020" {...field} /></FormControl>
                  <FormDescription>Briefly describe your vehicle (make, model, color).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rideNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Ride Notes (Optional)</FormLabel>
                  <FormControl><Textarea placeholder="E.g., Luggage restrictions, music preference, pets allowed/not allowed." {...field} rows={3}/></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end">
              <Button type="submit" size="lg" className="bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <PlusCircle className="mr-2 h-5 w-5" />
                )}
                {isLoading ? 'Submitting Offer...' : 'Submit Ride Offer'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OfferRideForm;