// frontend/components/dashboards/DriverDashboard.tsx
'use client';

import React from 'react';
import { User } from '@/types'; // Assuming User type is in @/types
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';
import { Car, PlusCircle, ListOrdered, AlertTriangle, FileText, CheckCircle2, Navigation } from 'lucide-react'; // Added Navigation icon

interface DriverDashboardProps {
  user: User;
}

const DriverDashboard = ({ user }: DriverDashboardProps) => {
  console.log("driver status in driver dashboard component: ", user);
  const isProfileApproved = user.driverStatus === 'APPROVED';
  const isProfilePending = user.driverStatus === 'PENDING_VERIFICATION';
  const isProfileRejected = user.driverStatus === 'REJECTED';
  const needsProfileCompletion = !isProfileApproved && !isProfilePending; // Rejected or not yet started

  return (
    <div className="flex flex-col flex-grow p-6 md:p-8 lg:p-10 space-y-8">
      {/* Welcome Header */}
      <header className="mb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
          Driver Dashboard
        </h1>
        <p className="text-lg text-muted-foreground dark:text-gray-400">
          Hello {user.firstName}, manage your rides and earnings here.
        </p>
      </header>

      {/* Profile Status Alert / Prompt */}
      {!isProfileApproved && (
        <Alert variant={isProfileRejected ? "destructive" : "default"} className={isProfilePending ? "bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300" : needsProfileCompletion && !isProfileRejected ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300" : ""}>
          {isProfilePending ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          <AlertTitle className="font-semibold">
            {isProfilePending
              ? "Driver Profile Under Review"
              : isProfileRejected
              ? "Action Required: Profile Rejected"
              : "Complete Your Driver Profile"}
          </AlertTitle>
          <AlertDescription className="space-y-2">
            {isProfilePending &&
              "Your documents are being reviewed. We'll notify you once it's complete (usually 1-2 business days)."}
            {isProfileRejected &&
              "There was an issue with your submitted documents. Please review them and make necessary corrections."}
            {needsProfileCompletion && !isProfileRejected &&
              "To start offering rides, please complete your driver profile by uploading the required documents."}
            <div className="mt-2">
              {/* This Link might also benefit from the Button asChild pattern if issues arise */}
              <Link href="/profile-settings/upload-documents" passHref legacyBehavior>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  {isProfilePending ? "View Submitted Documents" : "Go to Document Uploads"}
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isProfileApproved && (
         <Alert className="bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
            <CheckCircle2 className="h-5 w-5" />
            <AlertTitle className="font-semibold">Driver Profile Approved!</AlertTitle>
            <AlertDescription>
              You're all set to offer rides and start earning.
            </AlertDescription>
        </Alert>
      )}


      {/* Main Action Cards/Grid - Conditionally enabled if profile is approved */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 ${!isProfileApproved ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Card 1: Offer a Ride */}
        <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
          <CardHeader className="pb-4">
             <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">Offer a New Ride</CardTitle>
                <PlusCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardDescription className="pt-1">
              Create a new ride offer for passengers to book.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground mb-4">
              Set your departure and destination, date, time, available seats, and price per seat.
            </p>
          </CardContent>
          <CardFooter>
            {/* Consider updating this to the Button asChild pattern for consistency */}
            <Button asChild size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={!isProfileApproved}>
              <Link href="/driver/offer-ride">
                <PlusCircle className="mr-2 h-5 w-5" /> Create Ride Offer
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* New Card: Circle Button for Quick Action */}
        <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-2xl font-semibold">Quick Start</CardTitle>
            <CardDescription className="pt-1">
              Instantly start a new activity.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center p-4">
            {/* CORRECTED LINK AND BUTTON USAGE */}
            <Button
              asChild // Add asChild to Button
              variant="default"
              className="w-28 h-28 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-xl
                         transform transition-transform hover:scale-105
                         focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500
                         flex items-center justify-center"
              disabled={!isProfileApproved}
              aria-label="Quick Start New Activity"
            >
              <Link href="/driver/quick-start"> {/* Remove passHref and legacyBehavior from Link */}
                <Navigation className="w-12 h-12" /> {/* Icon is now a child of Link */}
              </Link>
            </Button>
          </CardContent>
          <CardFooter className="pt-3 justify-center">
            <p className="text-xs text-muted-foreground text-center">e.g., Go online, start predefined route</p>
          </CardFooter>
        </Card>

        {/* Card 2 (now 3rd): Manage My Rides */}
        <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">Manage My Rides</CardTitle>
                <ListOrdered className="h-8 w-8 text-blue-500" />
            </div>
            <CardDescription className="pt-1">
              View, update, or cancel your scheduled rides. Manage booking requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground mb-4">
              Oversee all your active and past ride offers. Confirm or reject passenger booking requests, and manage the lifecycle of your rides.
            </p>
          </CardContent>
          <CardFooter>
             {/* Consider updating this to the Button asChild pattern for consistency */}
            <Button asChild size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={!isProfileApproved}>
              <Link href="/driver/my-rides">
                <ListOrdered className="mr-2 h-5 w-5" /> View My Offered Rides
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* ... rest of your component */}
    </div>
  );
};

export default DriverDashboard;