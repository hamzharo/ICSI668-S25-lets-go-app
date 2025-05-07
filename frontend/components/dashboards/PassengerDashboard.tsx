// frontend/components/dashboards/PassengerDashboard.tsx
'use client';

import React from 'react';
import { User } from '@/types'; // Assuming User type is in @/types
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from 'next/link';
import { Search, ListChecks, Car } from 'lucide-react'; // Icons

interface PassengerDashboardProps {
  user: User;
}

const PassengerDashboard = ({ user }: PassengerDashboardProps) => {
  return (
    <div className="flex flex-col flex-grow p-6 md:p-8 lg:p-10 space-y-8">
      {/* Welcome Header */}
      <header className="mb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-lg text-muted-foreground dark:text-gray-400">
          Ready to find your next ride? Let's get you where you need to go.
        </p>
      </header>

      {/* Main Action Cards/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Card 1: Find a Ride */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">Find a Ride</CardTitle>
                <Search className="h-8 w-8 text-blue-500" />
            </div>
            <CardDescription className="pt-1">
              Search for available rides to your destination.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Enter your departure and arrival locations, and preferred travel dates to find matching rides offered by our drivers.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/search-rides" passHref legacyBehavior>
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Search className="mr-2 h-5 w-5" /> Search Rides
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Card 2: My Bookings */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">My Bookings</CardTitle>
                <ListChecks className="h-8 w-8 text-green-500" />
            </div>
            <CardDescription className="pt-1">
              View and manage your active and past ride bookings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Keep track of your confirmed rides, check their status, view details, or cancel bookings if your plans change.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/my-bookings" passHref legacyBehavior>
              <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white">
                <ListChecks className="mr-2 h-5 w-5" /> View My Bookings
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Optional: Ride History Snippet or other info */}
      {/* <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Quick Look: Ride History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Your last 3 rides will show here...</p>
             TODO: Fetch and display a snippet of ride history 
            <div className="mt-4 text-right">
                <Link href="/ride-history" className="text-sm text-blue-600 hover:underline">
                    View All Ride History
                </Link>
            </div>
          </CardContent>
        </Card>
      </div> */}

    </div>
  );
};

export default PassengerDashboard;