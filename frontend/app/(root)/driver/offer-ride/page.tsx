// frontend/app/(root)/driver/offer-ride/page.tsx
'use client';

import React from 'react';
import OfferRideForm from '@/components/driver/OfferRideForm'; // Import the form component
import { useAuth } from '@/lib/AuthContext';
import { Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation'; // For potential redirect
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function OfferRidePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  console.log("offer-ride - Page mounted");

  if (authLoading) {
    console.log("offer-ride - Auth is loading...");
    return (
      <div className="flex flex-grow items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if not logged in or not a driver
  if (!user) {
    console.log("offer-ride - No user, redirecting to login");
    // This should ideally be caught by middleware or (root)/layout.tsx
    // But as a fallback:
    router.replace('/login?redirect=/driver/offer-ride');
    return null; // Render nothing while redirecting
  }

  console.log("offer-ride - User object from useAuth():", JSON.stringify(user, null, 2));
  console.log("offer-ride - User roles from useAuth():", user.roles);
  console.log("offer-ride - User driverStatus from useAuth():", user.driverStatus);

  if (!user.roles.includes('DRIVER')) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center p-6 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Access Denied</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          You must be registered as a Driver to offer rides.
        </p>
        <Button onClick={() => router.push('/')} variant="outline">Go to Dashboard</Button>
      </div>
    );
  }

  // Check for driver approval status
  if (user.driverStatus !== 'APPROVED') {
    console.log(`offer-ride - Driver status is ${user.driverStatus}, NOT 'APPROVED'. Showing 'Profile Not Active' UI.`);
    let alertMessage = "Your driver profile is not yet approved. You need an approved profile to offer rides.";
    let buttonText = "Check Document Status";
    let buttonLink = "/profile-settings/upload-documents";

    if (user.driverStatus === 'PENDING_APPROVAL') {
        alertMessage = "Your driver profile is currently under review. You'll be able to offer rides once it's approved.";
    } else if (user.driverStatus === 'REJECTED') {
        alertMessage = "There was an issue with your driver application. Please check your documents and resubmit if necessary.";
    } else if (!user.driverStatus || user.driverStatus === null ) { // Covers cases where status might be null or undefined initially
        alertMessage = "Please complete your driver profile and submit your documents for verification to offer rides.";
    }


    return (
        <div className="flex flex-col flex-grow items-center justify-center p-6 md:p-10 text-center">
            <ShieldAlert className="h-16 w-16 text-yellow-500 mb-6" />
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white mb-3">
              Driver Profile Not Active
            </h2>
            <p className="text-muted-foreground max-w-lg mb-8 text-md">
              {alertMessage}
            </p>
            <Link href={buttonLink} passHref legacyBehavior>
                <Button size="lg" variant="default">
                    {buttonText}
                </Button>
            </Link>
             <Button variant="outline" size="lg" onClick={() => router.push('/')} className="mt-4">
                Back to Dashboard
            </Button>
        </div>
    );
  } else {
    console.log("offer-ride - Driver status IS 'APPROVED'. Rendering OfferRideForm.");
  }

  // If user is a DRIVER and APPROVED, render the form
  return (
    <div className="flex flex-col flex-grow p-4 md:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      <header className="mb-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
          Create a New Ride Offer
        </h1>
        <p className="text-lg text-muted-foreground dark:text-gray-400">
          Share your journey! Fill out the details below to let passengers know about your upcoming trip.
        </p>
      </header>
      <Separator />
      <OfferRideForm />
    </div>
  );
}