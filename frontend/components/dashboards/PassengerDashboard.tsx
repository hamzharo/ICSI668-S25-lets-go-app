// frontend/components/dashboards/PassengerDashboard.tsx
'use client';

import React from 'react';
import { User } from '@/types'; // Assuming User type is in @/types
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from 'next/link';
import { Search, ListChecks } from 'lucide-react';
// Ensure this path is correct for your PassengerNavigationSidebar component
import PassengerNavigationSidebar from '@/components/sidebars/PassengerNavigationSidebar';

interface PassengerDashboardProps {
  user: User; // This component receives 'user' from its parent (likely a page or layout)
}

const PassengerDashboard = ({ user }: PassengerDashboardProps) => {
  // If for some reason 'user' could be null or undefined here,
  // you might want to add a check and return a loading/error state.
  if (!user) {
    return (
        <div className="flex items-center justify-center h-screen dark:bg-gray-900">
            <p className="text-muted-foreground dark:text-gray-400">Loading user data or user not available...</p>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-background dark:bg-gray-900"> {/* Main container: Sidebar + Content */}
      {/* The PassengerNavigationSidebar component is responsible for showing the user's photo */}
      {/* and providing a link/interaction to change it (e.g., by linking to an edit profile page). */}
      <PassengerNavigationSidebar initialUser={user} />

      <main className="flex-grow p-6 md:p-8 lg:p-10 space-y-8 overflow-y-auto">
        {/* Welcome Header */}
        <header className="mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            Welcome back, {user.firstName || user.username || 'Passenger'}!
          </h1>
          <p className="text-lg text-muted-foreground dark:text-gray-400">
            Ready to find your next ride? Let's get you where you need to go.
          </p>
        </header>

        {/* Main Action Cards/Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1: Find a Ride */}
          <Card className="hover:shadow-lg transition-shadow duration-300 bg-card dark:bg-gray-800">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-semibold text-card-foreground dark:text-white">Find a Ride</CardTitle>
                  <Search className="h-8 w-8 text-blue-500 dark:text-blue-400" />
              </div>
              <CardDescription className="pt-1 text-muted-foreground dark:text-gray-400">
                Search for available rides to your destination.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">
                Enter your departure and arrival locations, and preferred travel dates to find matching rides offered by our drivers.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/search-rides" passHref legacyBehavior>
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600">
                  <Search className="mr-2 h-5 w-5" /> Search Rides
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Card 2: My Bookings */}
          <Card className="hover:shadow-lg transition-shadow duration-300 bg-card dark:bg-gray-800">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-semibold text-card-foreground dark:text-white">My Bookings</CardTitle>
                  <ListChecks className="h-8 w-8 text-green-500 dark:text-green-400" />
              </div>
              <CardDescription className="pt-1 text-muted-foreground dark:text-gray-400">
                View and manage your active and past ride bookings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">
                Keep track of your confirmed rides, check their status, view details, or cancel bookings if your plans change.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/my-bookings" passHref legacyBehavior>
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600">
                  <ListChecks className="mr-2 h-5 w-5" /> View My Bookings
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Optional: Ride History Snippet or other info */}
        {/*
        <div className="mt-8">
          <Card className="bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-card-foreground dark:text-white">Quick Look: Ride History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground dark:text-gray-400">Your last 3 rides will show here...</p>
              // TODO: Fetch and display a snippet of ride history
              <div className="mt-4 text-right">
                  <Link href="/ride-history" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      View All Ride History
                  </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        */}
      </main>
    </div>
  );
};

export default PassengerDashboard;