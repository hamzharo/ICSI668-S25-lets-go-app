// frontend/components/rides/RideSearchForm.tsx
'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RideSearchFormValues } from '@/types'; // Import the type
import { Loader2, Search } from 'lucide-react';

// Zod schema for form validation
const rideSearchSchema = z.object({
  departureCity: z.string().min(1, "Departure city is required."),
  destinationCity: z.string().min(1, "Destination city is required."),
  earliestDepartureTime: z.string().min(1, "Departure date & time is required.") // Basic validation, refine if needed
    // You might want to validate that this is a valid date/time string
    // Or use a date picker component that returns a Date object, then format it.
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
      destinationCity: '',
      earliestDepartureTime: '', // Default to empty or current date/time formatted
    },
  });

  // useEffect to set a default date might be useful here
  // For example, set earliestDepartureTime to today at 00:00
  React.useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    // Format it as YYYY-MM-DDTHH:MM as required by <input type="datetime-local">
    // Or however your backend expects it (e.g., ISO string)
    const formattedDefaultDate = today.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
    form.setValue('earliestDepartureTime', formattedDefaultDate);
  }, [form]);


  const onSubmit: SubmitHandler<RideSearchFormValues> = (data) => {
    onSearch(data);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="departureCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leaving From</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., New York" {...field} />
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
                    <FormLabel>Going To</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Boston" {...field} />
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
                    {/* Using datetime-local input type. Consider a custom date picker for better UX. */}
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormDescription>
                    Select the earliest date and time you wish to depart.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add more fields like 'number of seats' if needed */}
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