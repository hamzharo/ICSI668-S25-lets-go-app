// frontend/components/driver/EditRideForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RideUpdateFormValues, RideUpdateDTO, DriverOfferedRide } from '@/types'; // RideDetail or DriverOfferedRide can be used for initialData
import { Loader2, Save, Car } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns'; // For formatting datetime-local inputs

// Zod schema for form validation (similar to offerRideSchema, but fields are optional for PUT)
// However, for the form itself, we might still want them required if they are being edited.
// For a true PATCH, all fields would be optional. For PUT, usually all editable fields are provided.
// Let's assume the form requires re-submission of key fields or makes them editable.
const editRideSchema = z.object({
  departureCity: z.string().min(2, "Departure city must be at least 2 characters."),
  destinationCity: z.string().min(2, "Destination city must be at least 2 characters."),
  departureTime: z.string().min(1, "Departure date & time is required."),
  estimatedArrivalTime: z.string().min(1, "Estimated arrival date & time is required."),
  availableSeats: z.coerce.number().min(0, "Seats cannot be negative.").max(10, "Maximum 10 seats."), // Min 0 if all booked
  pricePerSeat: z.coerce.number().min(0, "Price cannot be negative.").max(500, "Price seems too high."),
  vehicleDescription: z.string().min(5, "Vehicle description is required.").max(100),
  rideNotes: z.string().max(250, "Notes cannot exceed 250 characters.").optional(),
}).refine(data => new Date(data.estimatedArrivalTime) > new Date(data.departureTime), {
  message: "Estimated arrival time must be after departure time.",
  path: ["estimatedArrivalTime"],
})
// We might not need to validate future departure time here if the ride is already scheduled,
// or we might adjust it if they are allowed to postpone. For now, let's keep it flexible.
// .refine(data => new Date(data.departureTime) > new Date(Date.now() - 60000 * 5), { // Allow some past buffer if editing right before
//     message: "Departure time should generally be in the future.",
//     path: ["departureTime"],
// });


interface EditRideFormProps {
  rideId: string;
  initialData: DriverOfferedRide; // Pre-fill form with this data
  onUpdateSuccess: () => void; // Callback after successful update
}

// --- TODO: Replace with actual API service call ---
const updateRideOfferApi = async (rideId: string, rideData: RideUpdateDTO, token: string | null): Promise<any> => {
  if (!token) throw new Error("Authentication required.");
  console.log(`API CALL: Updating ride ${rideId} with data:`, rideData);
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rides/${rideId}`, {
  //   method: 'PUT',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${token}`,
  //   },
  //   body: JSON.stringify(rideData),
  // });

  // if (!response.ok) {
  //   const errorResult = await response.json().catch(() => ({ message: "Failed to update ride offer." }));
  //   throw new Error(errorResult.message || "An unexpected error occurred.");
  // }
  // return response.json();

  // Mock API response:
  return new Promise(resolve => setTimeout(() => {
    resolve({ success: true, message: "Ride offer updated successfully!", ride: { ...rideData, id: rideId } });
  }, 1500));
};
// --- End TODO ---

const EditRideForm = ({ rideId, initialData, onUpdateSuccess }: EditRideFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  // Helper to format ISO string to 'YYYY-MM-DDTHH:MM' for datetime-local input
  const formatDateTimeForInput = (isoString: string | undefined) => {
    if (!isoString) return '';
    try {
      // return format(new Date(isoString), "yyyy-MM-dd'T'HH:mm"); // date-fns v2
      return new Date(isoString).toISOString().slice(0, 16); // Simpler, works if not needing timezone conversion display
    } catch (e) {
      return '';
    }
  };

  const form = useForm<RideUpdateFormValues>({
    resolver: zodResolver(editRideSchema),
    defaultValues: {
      departureCity: initialData.departureCity || '',
      destinationCity: initialData.destinationCity || '',
      departureTime: formatDateTimeForInput(initialData.departureTime),
      estimatedArrivalTime: formatDateTimeForInput(initialData.estimatedArrivalTime),
      availableSeats: initialData.availableSeats ?? 0, // Use current availableSeats
      pricePerSeat: initialData.pricePerSeat ?? 0,
      vehicleDescription: initialData.vehicleDescription || '',
      rideNotes: initialData.rideNotes || '',
    },
  });

  // Reset form if initialData changes (e.g., parent re-fetches and passes new prop)
  useEffect(() => {
    form.reset({
      departureCity: initialData.departureCity || '',
      destinationCity: initialData.destinationCity || '',
      departureTime: formatDateTimeForInput(initialData.departureTime),
      estimatedArrivalTime: formatDateTimeForInput(initialData.estimatedArrivalTime),
      availableSeats: initialData.availableSeats ?? 0,
      pricePerSeat: initialData.pricePerSeat ?? 0,
      vehicleDescription: initialData.vehicleDescription || '',
      rideNotes: initialData.rideNotes || '',
    });
  }, [initialData, form]);


  const onSubmit: SubmitHandler<RideUpdateFormValues> = async (data) => {
    setIsLoading(true);

    const rideDataDTO: RideUpdateDTO = {
      ...data, // Spread validated form data
      // Convert datetime-local strings to full ISO 8601 strings for the backend
      departureTime: data.departureTime ? new Date(data.departureTime).toISOString() : undefined,
      estimatedArrivalTime: data.estimatedArrivalTime ? new Date(data.estimatedArrivalTime).toISOString() : undefined,
      availableSeats: Number(data.availableSeats), // Ensure it's a number
      pricePerSeat: Number(data.pricePerSeat),   // Ensure it's a number
    };

    try {
      await updateRideOfferApi(rideId, rideDataDTO, token);
      toast.success("Ride offer updated successfully!");
      onUpdateSuccess(); // Notify parent page (e.g., to redirect or refetch)
    } catch (error: any) {
      toast.error(error.message || "Failed to update ride offer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl font-semibold flex items-center">
          <Edit3 className="mr-3 h-6 w-6 text-primary" /> Edit Ride Offer
        </CardTitle>
        <CardDescription>
          Modify the details for your ride (ID: {rideId}). Changes may notify confirmed passengers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Form fields are identical to OfferRideForm, just pre-filled */}
            {/* For brevity, I'll list them conceptually. Refer to OfferRideForm.tsx for exact structure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="departureCity" render={({ field }) => (<FormItem><FormLabel>Departure City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="destinationCity" render={({ field }) => (<FormItem><FormLabel>Destination City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="departureTime" render={({ field }) => (<FormItem><FormLabel>Departure Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="estimatedArrivalTime" render={({ field }) => (<FormItem><FormLabel>Estimated Arrival Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="availableSeats" render={({ field }) => (<FormItem><FormLabel>Available Seats</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormDescription>Adjust carefully if passengers are booked.</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="pricePerSeat" render={({ field }) => (<FormItem><FormLabel>Price Per Seat ($)</FormLabel><FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="vehicleDescription" render={({ field }) => (<FormItem><FormLabel>Vehicle Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="rideNotes" render={({ field }) => (<FormItem><FormLabel>Additional Ride Notes (Optional)</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />

            <div className="pt-4 flex justify-end">
              <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading ? (<Loader2 className="mr-2 h-5 w-5 animate-spin" />) : (<Save className="mr-2 h-5 w-5" />)}
                {isLoading ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditRideForm;