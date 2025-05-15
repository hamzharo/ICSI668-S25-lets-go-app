// frontend/components/rides/RideSearchForm.tsx
'use client';

import React from 'react'; // Removed useState as form handles state
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RideSearchFormValues } from '@/types';
import { Loader2, Search, MapPin } from 'lucide-react'; // Added MapPin for state

// Zod schema for form validation - UPDATED
const rideSearchSchema = z.object({
  departureCity: z.string().min(1, "Departure city is required."),
  departureState: z.string().min(1, "Departure state is required.").max(50, "State should be 50 chars or less."), // ADDED
  destinationCity: z.string().min(1, "Destination city is required."),
  destinationState: z.string().min(1, "Destination state is required.").max(50, "State should be 50 chars or less."), // ADDED
  earliestDepartureTime: z.string().min(1, "Departure date & time is required.")
    // Consider further validation if backend expects strict ISO or specific format
    .refine(val => !isNaN(Date.parse(val)), {
        message: "Invalid date and time format.", // Basic check if it's parsable
    }),
});

interface RideSearchFormProps {
  onSearch: (searchParams: RideSearchFormValues) => void;
  isLoading: boolean;
}

const RideSearchForm = ({ onSearch, isLoading }: RideSearchFormProps) => {
  const form = useForm<RideSearchFormValues>({
    resolver: zodResolver(rideSearchSchema),
    defaultValues: {
      departureCity: '',
      departureState: '', // ADDED
      destinationCity: '',
      destinationState: '', // ADDED
      earliestDepartureTime: '',
    },
  });

  React.useEffect(() => {
    const today = new Date();
    // Set time to 00:00 for default, or let user pick
    // const formattedDefaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T00:00`;
    // Or keep it simple and let the input type="datetime-local" handle its default rendering
    // For a better UX, consider a dedicated date-time picker component.
    // For now, we'll set it to the current date and time.
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for local timezone for datetime-local
    const formattedDefaultDate = now.toISOString().slice(0,16);

    form.setValue('earliestDepartureTime', formattedDefaultDate);
  }, [form]);


  const onSubmit: SubmitHandler<RideSearchFormValues> = (data) => {
    const trimmedData: RideSearchFormValues = {
      departureCity: data.departureCity.trim(),
      departureState: data.departureState.trim(),
      destinationCity: data.destinationCity.trim(), 
      destinationState: data.destinationState.trim(),
      earliestDepartureTime: data.earliestDepartureTime, 
    };


    console.log("Form Data Submitted by RideSearchForm (trimmed):", trimmedData);

    // Call the onSearch prop with the CLEANED, TRIMMED data
    onSearch(trimmedData);

    // console.log("Form Data Submitted:", data); // For debugging
    // onSearch(data);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center">
          <Search className="mr-3 h-7 w-7 text-primary" /> Find Your Perfect Ride
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6"> {/* Adjusted gap for y-axis too */}
              <FormField
                control={form.control}
                name="departureCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leaving From City</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField // NEW DEPARTURE STATE FIELD
                control={form.control}
                name="departureState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure State</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., CA, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destinationCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Going To City</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Boston" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField // NEW DESTINATION STATE FIELD
                control={form.control}
                name="destinationState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination State</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., MA, FL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="earliestDepartureTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departure Date & Time (Earliest)</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormDescription>
                    Select the earliest date and time you wish to depart.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-2">
              <Button type="submit" className="w-full md:w-auto" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Search className="mr-2 h-5 w-5" />
                )}
                {isLoading ? 'Searching...' : 'Search Rides'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RideSearchForm;