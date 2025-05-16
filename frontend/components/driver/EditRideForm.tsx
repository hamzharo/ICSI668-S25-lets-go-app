// // frontend/components/driver/EditRideForm.tsx (New or Updated File)
// 'use client';

// import React, { useState } from 'react';
// import { useForm, SubmitHandler } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { DriverOfferedRide, RideUpdateDTO } from '@/types'; // Ensure RideUpdateDTO matches backend
// import { Loader2, Save } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { useAuth } from '@/lib/AuthContext';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// // Zod schema for form validation (should match RideUpdateDTO fields that are updatable)
// // This needs to align with what your RideUpdateDTO allows.
// // For example, if departure/destination cities cannot be changed, remove them.
// const editRideSchema = z.object({
//   departureCity: z.string().min(2, "Departure city must be at least 2 characters."),
//   departureState: z.string().min(2, "Departure state must be at least 2 characters."),
//   destinationCity: z.string().min(2, "Destination city must be at least 2 characters."),
//   destinationState: z.string().min(2, "Destination state must be at least 2 characters."),
//   departureTime: z.string().min(1, "Departure date & time is required."),
//   // estimatedArrivalTime: z.string().min(1, "Estimated arrival date & time is required."), // Often derived or not directly updatable by user
//   availableSeats: z.coerce.number().min(0, "Seats cannot be negative.").max(10, "Maximum 10 seats."), // Min 0 if ride can be full
//   pricePerSeat: z.coerce.number().min(0, "Price cannot be negative.").max(500, "Price seems too high."),
//   vehicleDescription: z.string().min(5, "Vehicle description is required.").max(100),
//   rideNotes: z.string().max(250, "Notes cannot exceed 250 characters.").optional(),
//   // Add other updatable fields from your RideUpdateDTO
// }).refine(data => new Date(data.departureTime) > new Date(Date.now() - 300000), { // 5 min buffer
//     message: "Departure time must be in the future.",
//     path: ["departureTime"],
// });
// // Add .refine for estimatedArrivalTime > departureTime if it's user-editable and required

// interface EditRideFormProps {
//   rideId: string;
//   initialData: DriverOfferedRide; // This is the full ride object fetched
//   onUpdateSuccess: () => void;
// }

// // API call to update the ride
// const updateRideApi = async (rideId: string, rideData: RideUpdateDTO, token: string | null): Promise<DriverOfferedRide> => {
//   if (!token) throw new Error("Authentication required.");

//   const url = `${API_BASE_URL}/api/driver/rides/${rideId}`; // Your PUT endpoint
//   console.log(`API CALL: Updating ride ${rideId} at ${url} with data:`, rideData);

//   const response = await fetch(url, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`,
//     },
//     body: JSON.stringify(rideData),
//   });

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({ message: `Failed to update ride. Status: ${response.status}` }));
//     const errorMessage = errorData.message || "Failed to update ride. Please try again.";
//     console.error("API Update Error:", errorMessage, errorData);
//     throw new Error(errorMessage);
//   }
//   return response.json();
// };


// const EditRideForm = ({ rideId, initialData, onUpdateSuccess }: EditRideFormProps) => {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const { token } = useAuth();

//   // Helper to convert ISO string to datetime-local format
//   const toDateTimeLocal = (isoString?: string): string => {
//     if (!isoString) return '';
//     try {
//       const date = new Date(isoString);
//       const offset = date.getTimezoneOffset() * 60000;
//       const localDate = new Date(date.getTime() - offset);
//       return localDate.toISOString().slice(0, 16);
//     } catch (e) {
//       return ''; // Fallback for invalid date string
//     }
//   };

//   const form = useForm<z.infer<typeof editRideSchema>>({
//     resolver: zodResolver(editRideSchema),
//     defaultValues: {
//       departureCity: initialData.departureCity || '',
//       departureState: initialData.departureState || '',
//       destinationCity: initialData.destinationCity || '',
//       destinationState: initialData.destinationState || '',
//       departureTime: toDateTimeLocal(initialData.departureTime),
//       // estimatedArrivalTime: toDateTimeLocal(initialData.estimatedArrivalTime),
//       availableSeats: initialData.availableSeats ?? initialData.totalSeats, // Use availableSeats if present, else totalSeats
//       pricePerSeat: initialData.pricePerSeat || 0, // farePerSeat from backend, pricePerSeat on form
//       vehicleDescription: initialData.vehicleDescription || '',
//       rideNotes: initialData.rideNotes || '',
//     },
//   });

//   const onSubmit: SubmitHandler<z.infer<typeof editRideSchema>> = async (data) => {
//     setIsSubmitting(true);

//     // Construct RideUpdateDTO from form data. Only include fields your DTO expects.
//     const rideUpdatePayload: RideUpdateDTO = {
//       ...data, // Spreads all form fields
//       departureTime: new Date(data.departureTime).toISOString(), // Ensure ISO format
//       // Map field names if they differ, e.g., pricePerSeat (form) to farePerSeat (DTO)
//       // totalSeats: Number(data.availableSeats), // Example: if your DTO needs totalSeats from availableSeats
//       // farePerSeat: Number(data.pricePerSeat),
      
//       // Ensure you only send fields that are part of RideUpdateDTO
//       // For example, if RideUpdateDTO only has:
//       // departureTime, availableSeats, pricePerSeat, vehicleDescription, rideNotes
//       // then you'd construct it like:
//       // departureTime: new Date(data.departureTime).toISOString(),
//       // availableSeats: Number(data.availableSeats),
//       // pricePerSeat: Number(data.pricePerSeat),
//       // vehicleDescription: data.vehicleDescription,
//       // rideNotes: data.rideNotes,
//     };
//     // Remove fields not in RideUpdateDTO if necessary, e.g. if cities are not updatable:
//     // delete (rideUpdatePayload as any).departureCity; 
//     // delete (rideUpdatePayload as any).departureState;
//     // delete (rideUpdatePayload as any).destinationCity;
//     // delete (rideUpdatePayload as any).destinationState;


//     try {
//       await updateRideApi(rideId, rideUpdatePayload, token);
//       toast.success("Ride details updated successfully!");
//       onUpdateSuccess(); // Callback to handle navigation or other actions
//     } catch (error: any) {
//       toast.error(error.message || "Failed to update ride. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Card className="w-full shadow-lg">
//       <CardHeader>
//         <CardTitle className="text-xl md:text-2xl">Update Ride Information</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//             {/* Departure and Destination - Conditionally render if editable */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <FormField
//                 control={form.control}
//                 name="departureCity"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Departure City</FormLabel>
//                     <FormControl><Input placeholder="E.g., Los Angeles" {...field} /></FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="departureState"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Departure State</FormLabel>
//                     <FormControl><Input placeholder="E.g., CA" {...field} /></FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <FormField
//                 control={form.control}
//                 name="destinationCity"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Destination City</FormLabel>
//                     <FormControl><Input placeholder="E.g., San Francisco" {...field} /></FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="destinationState"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Destination State</FormLabel>
//                     <FormControl><Input placeholder="E.g., CA" {...field} /></FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* Times */}
//             <FormField
//               control={form.control}
//               name="departureTime"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>New Departure Date & Time</FormLabel>
//                   <FormControl><Input type="datetime-local" {...field} /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             {/* Add estimatedArrivalTime if it's editable */}

//             {/* Seats & Price */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <FormField
//                 control={form.control}
//                 name="availableSeats"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Available Seats</FormLabel>
//                     <FormControl><Input type="number" min="0" placeholder="E.g., 2" {...field} /></FormControl>
//                     <FormDescription>Number of seats currently available.</FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="pricePerSeat"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Price Per Seat ($)</FormLabel>
//                     <FormControl><Input type="number" step="0.01" min="0" placeholder="E.g., 20.00" {...field} /></FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <FormField
//               control={form.control}
//               name="vehicleDescription"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Vehicle Description</FormLabel>
//                   <FormControl><Input placeholder="E.g., Toyota Prius, Silver" {...field} /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="rideNotes"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Additional Ride Notes (Optional)</FormLabel>
//                   <FormControl><Textarea placeholder="Any specific instructions or details." {...field} rows={3}/></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="pt-4 flex justify-end">
//               <Button type="submit" size="lg" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
//                 {isSubmitting ? (
//                   <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                 ) : (
//                   <Save className="mr-2 h-5 w-5" />
//                 )}
//                 {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </CardContent>
//     </Card>
//   );
// };

// export default EditRideForm;



// frontend/components/driver/EditRideForm.tsx
'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Ensure RideUpdateDTO and DriverOfferedRide are imported and correctly defined in '@/types'
import { DriverOfferedRide, RideUpdateDTO } from '@/types';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/lib/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Zod schema for the FORM - this can have more fields than RideUpdateDTO
// if some form fields are for display or client-side logic only.
// However, it must contain all fields you intend to map to RideUpdateDTO.
const editRideFormSchema = z.object({
  // These field names are for the form. They might map to different names in RideUpdateDTO.
  formDepartureCity: z.string().min(2, "Departure city must be at least 2 characters."),
  formDepartureState: z.string().min(2, "Departure state must be at least 2 characters."),
  formDestinationCity: z.string().min(2, "Destination city must be at least 2 characters."),
  formDestinationState: z.string().min(2, "Destination state must be at least 2 characters."),
  formDepartureTime: z.string().min(1, "Departure date & time is required."),
  formAvailableSeats: z.coerce.number().min(0, "Seats cannot be negative.").max(10, "Maximum 10 seats."),
  formPricePerSeat: z.coerce.number().min(0, "Price cannot be negative.").max(500, "Price seems too high."),
  formVehicleDescription: z.string().min(5, "Vehicle description is required.").max(100),
  formRideNotes: z.string().max(250, "Notes cannot exceed 250 characters.").optional(),
}).refine(data => new Date(data.formDepartureTime) > new Date(Date.now() - 300000), { // 5 min buffer
    message: "Departure time must be in the future.",
    path: ["formDepartureTime"], // Path should match form field name
});

// Define a type for the form values based on the Zod schema
type EditRideFormValues = z.infer<typeof editRideFormSchema>;

interface EditRideFormProps {
  rideId: string;
  initialData: DriverOfferedRide; // Data fetched from backend (GET /api/rides/{id})
  onUpdateSuccess: () => void;
}

// API call to update the ride
const updateRideApi = async (rideId: string, rideDataPayload: RideUpdateDTO, token: string | null): Promise<DriverOfferedRide> => {
  if (!token) throw new Error("Authentication required.");
  const url = `${API_BASE_URL}/api/driver/rides/${rideId}`;
  console.log(`API CALL: Updating ride ${rideId} at ${url}`);
  console.log(`API PAYLOAD (RideUpdateDTO):`, JSON.stringify(rideDataPayload, null, 2));

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(rideDataPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to update ride. Status: ${response.status}` }));
    const errorMessage = errorData.message || `Server error: ${response.status}. Please check console for details.`;
    console.error("API Update Error Response Body:", errorData); // Log the full error from backend
    toast.error(errorMessage); // Show more specific error if available
    throw new Error(errorMessage);
  }
  return response.json(); // Assuming backend returns the updated ride
};


const EditRideForm = ({ rideId, initialData, onUpdateSuccess }: EditRideFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const toDateTimeLocal = (isoString?: string | null): string => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      // Correctly convert to local datetime-local string format
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) { return ''; }
  };

  const form = useForm<EditRideFormValues>({
    resolver: zodResolver(editRideFormSchema),
    defaultValues: {
      // Map initialData (DriverOfferedRide) fields to form field names
      formDepartureCity: initialData.departureCity || '',
      formDepartureState: initialData.departureState || '',
      formDestinationCity: initialData.destinationCity || '',
      formDestinationState: initialData.destinationState || '',
      formDepartureTime: toDateTimeLocal(initialData.departureTime),
      formAvailableSeats: initialData.availableSeats, // Assuming backend returns 'availableSeats'
      formPricePerSeat: initialData.pricePerSeat,     // Assuming backend returns 'farePerSeat'
      formVehicleDescription: initialData.vehicleDescription || '',
      formRideNotes: initialData.rideNotes || '',
    },
  });

  const onSubmit: SubmitHandler<EditRideFormValues> = async (formData) => {
    setIsSubmitting(true);
    console.log("Form Data (EditRideFormValues):", formData);

    // CRITICAL STEP: Manually construct the RideUpdateDTO payload
    // Only include fields that your backend's RideUpdateDTO accepts
    // And ensure field names match the backend DTO
    const rideUpdatePayload: RideUpdateDTO = {};

    // Example mapping: Check your backend DTO for which fields are updatable
    if (initialData.departureCity !== formData.formDepartureCity) { // Only send if changed, or if backend always expects it
        rideUpdatePayload.departureCity = formData.formDepartureCity;
    }
    if (initialData.departureState !== formData.formDepartureState) {
        rideUpdatePayload.departureState = formData.formDepartureState;
    }
    if (initialData.destinationCity !== formData.formDestinationCity) {
        rideUpdatePayload.destinationCity = formData.formDestinationCity;
    }
     if (initialData.destinationState !== formData.formDestinationState) {
        rideUpdatePayload.destinationState = formData.formDestinationState;
    }
    // Always send time, or check if changed
    rideUpdatePayload.departureTime = new Date(formData.formDepartureTime).toISOString().split('.')[0]; // YYYY-MM-DDTHH:mm:ss

    // Map formPricePerSeat to farePerSeat if backend expects farePerSeat
    if (initialData.pricePerSeat !== formData.formPricePerSeat) {
        rideUpdatePayload.pricePerSeat = Number(formData.formPricePerSeat);
    }
    // Map formAvailableSeats to availableSeats if backend expects availableSeats
    if (initialData.availableSeats !== formData.formAvailableSeats) {
        rideUpdatePayload.availableSeats = Number(formData.formAvailableSeats);
    }

    if (initialData.vehicleDescription !== formData.formVehicleDescription) {
        rideUpdatePayload.vehicleDescription = formData.formVehicleDescription;
    }
    if (initialData.rideNotes !== formData.formRideNotes) {
        rideUpdatePayload.rideNotes = formData.formRideNotes || null; // Send null if empty and backend allows
    }
    
    // If your backend DTO expects ALL fields even if not changed, then assign them directly:
    // rideUpdatePayload.departureCity = formData.formDepartureCity;
    // rideUpdatePayload.departureState = formData.formDepartureState;
    // ... and so on for all fields in your backend RideUpdateDTO.

    // Defensive check: remove any undefined properties if your backend is strict
    Object.keys(rideUpdatePayload).forEach(key => {
        if ((rideUpdatePayload as any)[key] === undefined) {
            delete (rideUpdatePayload as any)[key];
        }
    });
    
    console.log("Final Payload to API (RideUpdateDTO):", JSON.stringify(rideUpdatePayload, null, 2));

    if (Object.keys(rideUpdatePayload).length === 0) {
        toast.info("No changes detected to update.");
        setIsSubmitting(false);
        return;
    }

    try {
      await updateRideApi(rideId, rideUpdatePayload, token);
      toast.success("Ride details updated successfully!");
      onUpdateSuccess();
    } catch (error: any) {
      // Error toast is handled by updateRideApi
      console.error("Update submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Update Ride Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Ensure 'name' prop in FormField matches keys in editRideFormSchema */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="formDepartureCity" /* Matches schema */
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
                name="formDepartureState" /* Matches schema */
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure State</FormLabel>
                    <FormControl><Input placeholder="E.g., CA" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="formDestinationCity" /* Matches schema */
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
                name="formDestinationState" /* Matches schema */
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination State</FormLabel>
                    <FormControl><Input placeholder="E.g., CA" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="formDepartureTime" /* Matches schema */
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Departure Date & Time</FormLabel>
                  <FormControl><Input type="datetime-local" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="formAvailableSeats" /* Matches schema */
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Seats</FormLabel>
                    <FormControl><Input type="number" min="0" placeholder="E.g., 2" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="formPricePerSeat" /* Matches schema */
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Per Seat ($)</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0" placeholder="E.g., 20.00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="formVehicleDescription" /* Matches schema */
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Description</FormLabel>
                  <FormControl><Input placeholder="E.g., Toyota Prius, Silver" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="formRideNotes" /* Matches schema */
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Ride Notes (Optional)</FormLabel>
                  <FormControl><Textarea placeholder="Any specific instructions or details." {...field} rows={3}/></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end">
              <Button type="submit" size="lg" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditRideForm;