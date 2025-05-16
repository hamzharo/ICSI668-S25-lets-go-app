// frontend/components/driver/OfferRideForm.tsx
'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RideCreationFormValues, RideCreationDTO } from '@/types'; // Ensure RideCreationDTO matches backend payload
import { Loader2, Car, PlusCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

// Zod schema for form validation (matches your provided version)
const offerRideSchema = z.object({
  departureCity: z.string().min(2, "Departure city must be at least 2 characters."),
  departureState: z.string().min(2, "Departure state must be at least 2 characters."),
  destinationCity: z.string().min(2, "Destination city must be at least 2 characters."),
  destinationState: z.string().min(2, "Destination state must be at least 2 characters."),
  departureTime: z.string().min(1, "Departure date & time is required."),
  estimatedArrivalTime: z.string().min(1, "Estimated arrival date & time is required."),
  availableSeats: z.coerce.number().min(1, "At least 1 seat must be available.").max(10, "Maximum 10 seats."),
  pricePerSeat: z.coerce.number().min(0, "Price cannot be negative.").max(500, "Price seems too high."),
  vehicleDescription: z.string().min(5, "Vehicle description is required (e.g., Toyota Camry, Blue).").max(100),
  rideNotes: z.string().max(250, "Notes cannot exceed 250 characters.").optional(),
}).refine(data => new Date(data.estimatedArrivalTime) > new Date(data.departureTime), {
  message: "Estimated arrival time must be after departure time.",
  path: ["estimatedArrivalTime"],
}).refine(data => new Date(data.departureTime) > new Date(Date.now() - 60000), {
    message: "Departure time must be in the future.",
    path: ["departureTime"],
});


interface OfferRideFormProps {
  // Props if needed
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// --- Actual API service call ---
const createRideOfferApi = async (rideData: RideCreationDTO, token: string | null): Promise<any> => {
  if (!token) {
    console.error("API CALL ERROR: No authentication token provided.");
    throw new Error("Authentication token is missing. Please log in again.");
  }
  
  const url = `${API_BASE_URL}/api/driver/offer-ride`;
  console.log("API CALL: Creating ride offer to URL:", url);
  console.log("API CALL: Payload:", JSON.stringify(rideData, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Essential for JSON payloads
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(rideData), // Send the actual data
    });

    let responseBody;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
        responseBody = await response.json();
    } else {
        // If not JSON, read as text. This could be an HTML error page or plain text error.
        const textResponse = await response.text();
        responseBody = { message: textResponse || `Server returned status ${response.status} with non-JSON response.` };
    }
    
    console.log("API Response Status:", response.status);
    console.log("API Response Body:", responseBody);

    if (!response.ok) {
      const errorMessage = responseBody?.message || responseBody?.error || `Failed to create ride offer. Server responded with ${response.status}.`;
      console.error("API Error:", errorMessage, responseBody);
      throw new Error(errorMessage);
    }

    // Assuming backend returns a meaningful response on success
    // e.g., { success: true, message: "Ride offer created successfully!", rideId: "..." }
    // or the created ride object.
    return responseBody;
  } catch (error: any) {
    console.error("Error during createRideOfferApi call:", error);
    // Ensure the error thrown has a 'message' property for the toast
    if (error instanceof Error) {
        throw error;
    } else {
        throw new Error(String(error.message || "An unknown error occurred while contacting the server."));
    }
  }
};
// --- End API call ---


const OfferRideForm = ({}: OfferRideFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  const form = useForm<RideCreationFormValues>({ // RideCreationFormValues comes from Zod schema
    resolver: zodResolver(offerRideSchema),
    defaultValues: {
      departureCity: '',
      departureState: '',
      destinationCity: '',
      destinationState: '',
      departureTime: '',
      estimatedArrivalTime: '',
      availableSeats: 1,
      pricePerSeat: 10,
      vehicleDescription: '',
      rideNotes: '',
    },
  });

  React.useEffect(() => {
    const now = new Date();
    const defaultDeparture = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    const defaultArrival = new Date(defaultDeparture.getTime() + 3 * 60 * 60 * 1000); // 3 hours after departure

    // Format for datetime-local input: YYYY-MM-DDTHH:mm
    const toDateTimeLocal = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().slice(0,16);
    }
    
    form.setValue('departureTime', toDateTimeLocal(defaultDeparture));
    form.setValue('estimatedArrivalTime', toDateTimeLocal(defaultArrival));
  }, [form]);

  const onSubmit: SubmitHandler<RideCreationFormValues> = async (data) => {
    setIsLoading(true);

    const rideDataForApi: RideCreationDTO = {
      departureCity: data.departureCity,
      destinationCity: data.destinationCity,
      departureState: data.departureState,
      destinationState: data.destinationState,

      departureTime: new Date(data.departureTime).toISOString().split('.')[0],
      
      totalSeats: Number(data.availableSeats), // Map form field to backend field
      farePerSeat: Number(data.pricePerSeat),   // Map form field to backend field

     
    };

    try {
      const result = await createRideOfferApi(rideDataForApi, token);
      toast.success(result.message || "Ride offer created successfully!");
      form.reset();
      router.push('/driver/my-rides');
    } catch (error: any) {
      console.error("Form submission error:", error);
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
            {/* Row 1: Departure City & State */}
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
                name="departureState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure State</FormLabel>
                    <FormControl><Input placeholder="E.g., CA" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2: Destination City & State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <FormField
                control={form.control}
                name="destinationState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination State</FormLabel>
                    <FormControl><Input placeholder="E.g., CA" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 3: Times */}
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

            {/* Row 4: Seats & Price */}
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