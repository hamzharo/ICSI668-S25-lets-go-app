// frontend/app/(root)/passenger/become-driver/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext'; // Ensure this path is correct
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button'; // Ensure path is correct
import { Input } from '@/components/ui/input';   // Ensure path is correct
import { Label } from '@/components/ui/label';   // Ensure path is correct
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // Ensure path
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Ensure path
import { Loader2, Info, CheckCircle, ShieldAlert, CarIcon } from 'lucide-react'; // Added CarIcon
import { toast } from 'react-toastify';
import { DriverApplicationFormValues, DriverApplicationDTO } from '@/types'; // We'll define these below or ensure they exist in your types

// --- Types (ensure these are in your @/types/index.ts or similar) ---
// If not, you can temporarily define them here or preferably in your main types file.
/*
export interface DriverApplicationFormValues {
  licenseNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  vehiclePlateNumber: string;
}

export interface DriverApplicationDTO {
  id: string;
  userId: string;
  licenseNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  vehiclePlateNumber: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | string;
  applicationDate: string; // ISO Date string
}
*/
// --- End Types ---


// --- API Call Stubs ---
// These functions represent calls to your backend.
// You will need to implement the actual backend endpoints and update these.

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL; // Make sure this is in your .env.local

async function applyToBecomeDriverApi(
  applicationData: DriverApplicationFormValues,
  token: string
): Promise<DriverApplicationDTO> {
  console.log('[applyToBecomeDriverApi] Submitting data:', applicationData);
  if (!BASE_API_URL) {
      toast.error("API URL not configured. Cannot submit application.");
      throw new Error("API URL not configured");
  }
  // Replace with actual fetch call to your backend:
  // e.g., POST /api/driver-applications/apply
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate backend response
      if (applicationData.licenseNumber === "FAIL") {
         reject(new Error("Simulated backend error: Invalid license."));
      } else {
        const mockResponse: DriverApplicationDTO = {
          id: 'app-' + Date.now(),
          userId: 'user-123', // Should come from authenticated user
          ...applicationData,
          status: 'PENDING_APPROVAL',
          applicationDate: new Date().toISOString(),
        };
        console.log('[applyToBecomeDriverApi] Mock success response:', mockResponse);
        resolve(mockResponse);
      }
    }, 1500);
  });
}

async function checkDriverApplicationStatusApi(
  token: string
): Promise<DriverApplicationDTO | null> {
  console.log('[checkDriverApplicationStatusApi] Checking status...');
   if (!BASE_API_URL) {
      console.warn("API URL not configured. Cannot check status.");
      // For now, simulate no application if API URL is missing for local dev without backend
      return null;
  }
  // Replace with actual fetch call to your backend:
  // e.g., GET /api/driver-applications/status
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate different statuses - in real app, backend determines this
      // const randomStatus = Math.random();
      // if (randomStatus < 0.3) {
      //   resolve(null); // No application
      // } else if (randomStatus < 0.7) {
      //   resolve({ id: 'app-existing', userId: 'user-123', licenseNumber: 'L123', vehicleMake: 'MockMake', vehicleModel: 'MockModel', vehicleYear: '2022', vehicleColor: 'Red', vehiclePlateNumber: 'SPLATE1', status: 'PENDING_APPROVAL', applicationDate: new Date().toISOString() });
      // } else {
      //   resolve({ id: 'app-rejected', userId: 'user-123', licenseNumber: 'L456', vehicleMake: 'OtherMake', vehicleModel: 'OtherModel', vehicleYear: '2021', vehicleColor: 'Blue', vehiclePlateNumber: 'SPLATE2', status: 'REJECTED', applicationDate: new Date().toISOString() });
      // }
      resolve(null); // Default: Simulate no existing application for now
    }, 1000);
  });
}
// --- End API Call Stubs ---


// Zod schema for form validation
const applicationSchema = z.object({
  licenseNumber: z.string().min(5, "License number must be at least 5 characters").max(20, "License number too long"),
  vehicleMake: z.string().min(2, "Vehicle make is required").max(50),
  vehicleModel: z.string().min(1, "Vehicle model is required").max(50),
  vehicleYear: z.string().regex(/^(19[5-9]\d|20\d{2})$/, "Invalid year (e.g., 2023, min 1950)"), // Allows years from 1950 to 2099
  vehicleColor: z.string().min(3, "Vehicle color is required").max(30),
  vehiclePlateNumber: z.string().min(3, "Plate number must be at least 3 characters").max(10, "Plate number too long"),
});


export default function BecomeDriverPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<DriverApplicationDTO | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<DriverApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) { // Also check for token
        toast.error("You must be logged in to access this page.");
        router.push('/login'); // Or your login page route
        return;
      }
      // Your PassengerController.ts uses `role`, so we assume `user.role` exists.
      if (user.roles.includes("DRIVER") ) {
        setIsLoadingStatus(false); // No need to fetch status, already a driver
        return;
      }
      // Allow non-passengers to see the page if they are logged in,
      // backend will ultimately decide if they can apply.
      // if (user.role !== 'PASSENGER') {
      //   toast.warn("This page is intended for passengers wishing to become drivers.");
      // }


      
      const fetchStatus = async () => {
        setIsLoadingStatus(true);
        try {
          const status = await checkDriverApplicationStatusApi(token);
          setApplicationStatus(status);
        } catch (error: any) {
          console.error("Failed to fetch application status:", error.message);
          // Potentially show a toast if it's a real error, not just 'not found'
          // toast.error("Could not check application status: " + error.message);
        } finally {
          setIsLoadingStatus(false);
        }
      };
      fetchStatus();
    }
  }, [user, token, authLoading, router]);

  const onSubmit: SubmitHandler<DriverApplicationFormValues> = async (data) => {
    if (!token) {
      toast.error("Authentication error. Please log in again.");
      return;
    }
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      const result = await applyToBecomeDriverApi(data, token);
      toast.success("Application submitted successfully! You will be notified once it's reviewed.");
      setApplicationStatus(result); // Update status locally after successful mock/API call
      reset(); 
    } catch (error: any) {
      const errorMessage = error.message || "Failed to submit application. Please try again.";
      setSubmissionError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingStatus) {
    return (
      <div className="flex flex-grow items-center justify-center min-h-[calc(100vh-200px)]"> {/* Adjust min-height as needed */}
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading page data...</p>
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by useEffect redirect, but as a defensive measure
    return <div className="p-6 text-center">Redirecting to login...</div>;
  }
  
  if (user.roles.includes("DRIVER")) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="items-center text-center">
                <CarIcon className="h-12 w-12 text-green-500 mb-2" />
                <CardTitle className="text-2xl">You are a Driver!</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="default" className="bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <AlertTitle className="text-green-700 dark:text-green-300">Status: Approved Driver</AlertTitle>
                    <AlertDescription className="text-green-600 dark:text-green-400">
                        You can now offer rides. Go to your driver dashboard to get started.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (applicationStatus) {
    let alertVariant: "default" | "destructive" = "default"; // shadcn alert variants
    let Icon = Info;
    let title = "Application Status";
    let description = `Your application to become a driver is currently: ${applicationStatus.status.replace('_', ' ')}.`;

    if (applicationStatus.status === 'PENDING_APPROVAL') {
        alertVariant = "default"; Icon = Info; title = "Application Pending Review";
        description += " We will notify you once it has been reviewed.";
    } else if (applicationStatus.status === 'APPROVED') {
        // This case should ideally result in user.role being 'DRIVER' and handled above.
        // However, if there's a delay or the API returns this before role update:
        alertVariant = "default"; Icon = CheckCircle; title = "Application Approved!";
        description = "Your application has been approved! Your role should update shortly. If not, please log out and log back in.";
    } else if (applicationStatus.status === 'REJECTED') {
        alertVariant = "destructive"; Icon = ShieldAlert; title = "Application Update";
        description = "We regret to inform you that your recent application to become a driver was not approved at this time. Please check your email for more details or contact support if you have questions.";
    }

    return (
      <div className="container mx-auto p-4 md:p-8">
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="items-center text-center">
                 <Icon className={`h-12 w-12 mb-2 ${applicationStatus.status === 'REJECTED' ? 'text-red-500' : 'text-blue-500'}`} />
                <CardTitle className="text-2xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant={alertVariant}>
                    <Icon className="h-5 w-5" />
                    <AlertTitle>{title}</AlertTitle>
                    <AlertDescription>
                        {description}
                        <br/>
                        Applied on: {new Date(applicationStatus.applicationDate).toLocaleDateString()}
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      </div>
    );
  }

  // User is eligible to apply (not a driver, no existing application shown), show the form
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center md:text-left">Become a Driver</CardTitle>
          <CardDescription className="text-center md:text-left">
            Interested in driving with us? Fill out the form below to apply.
            Your application will be reviewed by our team.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {submissionError && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Application Error</AlertTitle>
                <AlertDescription>{submissionError}</AlertDescription>
              </Alert>
            )}
            <div>
              <h3 className="text-lg font-medium mb-3 border-b pb-2">Driver Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="licenseNumber">Driver's License Number</Label>
                  <Input id="licenseNumber" {...register('licenseNumber')} placeholder="e.g., S1234567D" />
                  {errors.licenseNumber && <p className="text-sm text-red-600 mt-1">{errors.licenseNumber.message}</p>}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 border-b pb-2">Vehicle Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <Label htmlFor="vehicleMake">Vehicle Make</Label>
                  <Input id="vehicleMake" {...register('vehicleMake')} placeholder="e.g., Toyota" />
                  {errors.vehicleMake && <p className="text-sm text-red-600 mt-1">{errors.vehicleMake.message}</p>}
                </div>
                <div>
                  <Label htmlFor="vehicleModel">Vehicle Model</Label>
                  <Input id="vehicleModel" {...register('vehicleModel')} placeholder="e.g., Camry" />
                  {errors.vehicleModel && <p className="text-sm text-red-600 mt-1">{errors.vehicleModel.message}</p>}
                </div>
                <div>
                  <Label htmlFor="vehicleYear">Vehicle Year</Label>
                  <Input id="vehicleYear" {...register('vehicleYear')} placeholder="e.g., 2020" type="text" />
                  {errors.vehicleYear && <p className="text-sm text-red-600 mt-1">{errors.vehicleYear.message}</p>}
                </div>
                <div>
                  <Label htmlFor="vehicleColor">Vehicle Color</Label>
                  <Input id="vehicleColor" {...register('vehicleColor')} placeholder="e.g., Blue" />
                  {errors.vehicleColor && <p className="text-sm text-red-600 mt-1">{errors.vehicleColor.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="vehiclePlateNumber">Vehicle Plate Number</Label>
                  <Input id="vehiclePlateNumber" {...register('vehiclePlateNumber')} placeholder="e.g., SGF1234X" />
                  {errors.vehiclePlateNumber && <p className="text-sm text-red-600 mt-1">{errors.vehiclePlateNumber.message}</p>}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}