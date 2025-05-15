// // frontend/components/dashboards/DriverDashboard.tsx
// 'use client';

// import React from 'react';
// import { User } from '@/types'; // Assuming your User type is here
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import Link from 'next/link';
// import {
//   PlusCircle, ListOrdered, AlertTriangle, FileText, CheckCircle2,
//   Navigation, BellRing
// } from 'lucide-react';
// import { useAuth } from '@/lib/AuthContext';
// import DriverNavigationSidebar from '@/components/sidebars/DriverNavigationSidebar'; // ACTION: VERIFY THIS IMPORT PATH

// interface DriverDashboardProps {
//   initialUser: User; // User data from server-side for initial render of the dashboard content
// }

// const DriverDashboard = ({ initialUser: initialDashboardUser }: DriverDashboardProps) => {
//   const { user: contextUser, isLoading: authIsLoading } = useAuth();

//   // Determine the user data to use.
//   // Prioritize fresh data from context if loaded, otherwise use server-provided initialUser.
//   const currentUser = authIsLoading ? initialDashboardUser : (contextUser || initialDashboardUser);

//   // If no user data is available at all (e.g., initialDashboardUser was null and context hasn't loaded or is also null)
//   // This is a critical state; the page might not be usable.
//   if (!currentUser) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <p>Loading user data or user not available...</p>
//         {/* Optionally, include a spinner or a more user-friendly message */}
//       </div>
//     );
//   }

//   // Dashboard specific logic based on currentUser
//   const isProfileApproved = currentUser.driverStatus === 'APPROVED';
//   const isProfilePending = currentUser.driverStatus === 'PENDING_APPROVAL';
//   const isProfileRejected = currentUser.driverStatus === 'REJECTED';
//   const isProfileNone = currentUser.driverStatus === 'NONE' || currentUser.driverStatus === null;
//   const needsProfileAttention = isProfileNone || isProfileRejected;

//   const renderProfileAlert = () => {
//     if (isProfileApproved) {
//       return (
//         <Alert className="bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
//           <CheckCircle2 className="h-5 w-5" />
//           <AlertTitle className="font-semibold">Driver Profile Approved!</AlertTitle>
//           <AlertDescription>
//             You're all set to offer rides and start earning.
//           </AlertDescription>
//         </Alert>
//       );
//     }

//     let alertVariant: "default" | "destructive" = "default";
//     let alertClasses = "";
//     let IconComponent = AlertTriangle;
//     let title = "";
//     let description = "";
//     let alertButtonText = "Go to Document Uploads";
//     let alertButtonLink = "/driver/upload-documents"; // ACTION: Verify this link

//     if (isProfilePending) {
//       alertClasses = "bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300";
//       IconComponent = BellRing;
//       title = "Driver Profile Under Review";
//       description = "Your documents are being reviewed. We'll notify you once it's complete (usually 1-2 business days).";
//       alertButtonText = "View Submitted Documents";
//     } else if (isProfileRejected) {
//       alertVariant = "destructive";
//       IconComponent = AlertTriangle;
//       title = "Action Required: Profile Rejected";
//       description = "There was an issue with your submitted documents. Please review them and make necessary corrections.";
//     } else if (isProfileNone) {
//       alertClasses = "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300";
//       IconComponent = FileText;
//       title = "Complete Your Driver Profile";
//       description = "To start offering rides, please complete your driver profile by uploading the required documents.";
//     } else {
//       console.warn("Unhandled driverStatus in DriverDashboard:", currentUser.driverStatus);
//       return null; // Or a default alert
//     }

//     return (
//       <Alert variant={alertVariant} className={alertClasses}>
//         <IconComponent className="h-5 w-5" />
//         <AlertTitle className="font-semibold">{title}</AlertTitle>
//         <AlertDescription className="space-y-2">
//           {description}
//           {(isProfilePending || needsProfileAttention) && (
//              <div className="mt-2">
//               <Button asChild variant="outline" size="sm">
//                 <Link href={alertButtonLink}>
//                   <FileText className="mr-2 h-4 w-4" />
//                   {alertButtonText}
//                 </Link>
//               </Button>
//             </div>
//           )}
//         </AlertDescription>
//       </Alert>
//     );
//   };

 
//   return (
//     <div className="flex h-screen"> {/* Main container for sidebar + content, taking full screen height */}
//       <DriverNavigationSidebar initialUser={currentUser} />

//       <main className="flex-grow p-6 md:p-8 lg:p-10 space-y-8 overflow-y-auto"> {/* Main content area takes remaining space and scrolls if needed */}
//         <header className="mb-4">
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
//             Driver Dashboard
//           </h1>
//           <p className="text-lg text-muted-foreground dark:text-gray-400">
//             Hello {currentUser.firstName || currentUser.username || 'Driver'}, manage your rides and earnings here.
//           </p>
//         </header>

//         {renderProfileAlert()}

//         <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 ${!isProfileApproved ? 'opacity-50 pointer-events-none' : ''}`}>
//           {/* Offer a New Ride Card */}
//           <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
//             <CardHeader className="pb-4">
//                <div className="flex items-center justify-between">
//                   <CardTitle className="text-2xl font-semibold">Offer a New Ride</CardTitle>
//                   <PlusCircle className="h-8 w-8 text-green-500" />
//               </div>
//               <CardDescription className="pt-1">Create a new ride offer for passengers to book.</CardDescription>
//             </CardHeader>
//             <CardContent className="flex-grow">
//               <p className="text-sm text-muted-foreground mb-4">Set your departure and destination, date, time, available seats, and price per seat.</p>
//             </CardContent>
//             <CardFooter>
//               <Button asChild size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={!isProfileApproved}>
//                 <Link href="/driver/offer-ride"><PlusCircle className="mr-2 h-5 w-5" /> Create Ride Offer</Link>
//               </Button>
//             </CardFooter>
//           </Card>

//           {/* Quick Action Card */}
//           <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
//             <CardHeader className="pb-2 text-center">
//               <CardTitle className="text-2xl font-semibold">Quick Action</CardTitle>
//               <CardDescription className="pt-1">Instantly access key features.</CardDescription>
//             </CardHeader>
//             <CardContent className="flex-grow flex flex-col items-center justify-center p-4">
//               <Button asChild variant="default" className="w-28 h-28 rounded-full bg-sky-600 hover:bg-sky-700 text-white shadow-xl transform transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 flex items-center justify-center" disabled={!isProfileApproved} aria-label="Quick Action">
//                 <Link href="/driver/quick-start"><Navigation className="w-12 h-12" /></Link>
//               </Button>
//             </CardContent>
//             <CardFooter className="pt-3 justify-center"><p className="text-xs text-muted-foreground text-center">e.g., View map, start predefined route</p></CardFooter>
//           </Card>

//           {/* Manage My Rides Card */}
//           <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
//             <CardHeader className="pb-4">
//               <div className="flex items-center justify-between">
//                   <CardTitle className="text-2xl font-semibold">Manage My Rides</CardTitle>
//                   <ListOrdered className="h-8 w-8 text-blue-500" />
//               </div>
//               <CardDescription className="pt-1">View, update, or cancel your scheduled rides. Manage booking requests.</CardDescription>
//             </CardHeader>
//             <CardContent className="flex-grow">
//               <p className="text-sm text-muted-foreground mb-4">Oversee all your active and past ride offers. Confirm or reject passenger booking requests, and manage the lifecycle of your rides.</p>
//             </CardContent>
//             <CardFooter>
//               <Button asChild size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={!isProfileApproved}>
//                 <Link href="/driver/my-rides"><ListOrdered className="mr-2 h-5 w-5" /> View My Offered Rides</Link>
//               </Button>
//             </CardFooter>
//           </Card>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default DriverDashboard;


// frontend/components/dashboards/DriverDashboard.tsx
'use client';

import React from 'react';
import { User, DriverStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';
import {
  PlusCircle, ListOrdered, AlertTriangle, FileText, CheckCircle2,
  Navigation, BellRing
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import DriverNavigationSidebar from '@/components/sidebars/DriverNavigationSidebar'; // Verify this path

interface DriverDashboardProps {
  initialUser: User;
}

const DriverDashboard = ({ initialUser: initialDashboardUser }: DriverDashboardProps) => {
  const { user: contextUser, isLoading: authIsLoading } = useAuth();
  const currentUser = authIsLoading ? initialDashboardUser : (contextUser || initialDashboardUser);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading user data or user not available...</p>
      </div>
    );
  }

  console.log("DriverDashboard - currentUser.firstName:", currentUser.firstName);
  console.log("DriverDashboard - currentUser.driverStatus (value):", currentUser.driverStatus);
  console.log("DriverDashboard - currentUser.driverStatus (type):", typeof currentUser.driverStatus);

  const isProfileApproved = currentUser.driverStatus === 'APPROVED';
  const isProfilePending = currentUser.driverStatus === 'PENDING_APPROVAL';
  const isProfileRejected = currentUser.driverStatus === 'REJECTED';
  const isProfileNone = currentUser.driverStatus === 'NONE' || currentUser.driverStatus === null;
  const needsProfileAttention = isProfileNone || isProfileRejected;

  console.log("DriverDashboard - isProfileApproved:", isProfileApproved);

  const renderProfileAlert = () => {
    if (isProfileApproved) {
      return (
        <Alert className="bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
          <CheckCircle2 className="h-5 w-5" />
          <AlertTitle className="font-semibold">Driver Profile Approved!</AlertTitle>
          <AlertDescription>
            You're all set to offer rides and start earning.
          </AlertDescription>
        </Alert>
      );
    }

    let alertVariant: "default" | "destructive" = "default";
    let alertClasses = "";
    let IconComponent = AlertTriangle;
    let title = "";
    let description = "";
    let alertButtonText = "Go to Document Uploads";
    let alertButtonLink = "/driver/upload-documents";

    if (isProfilePending) {
      alertClasses = "bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300";
      IconComponent = BellRing;
      title = "Driver Profile Under Review";
      description = "Your documents are being reviewed. We'll notify you once it's complete (usually 1-2 business days).";
      alertButtonText = "View Submitted Documents";
    } else if (isProfileRejected) {
      alertVariant = "destructive";
      IconComponent = AlertTriangle;
      title = "Action Required: Profile Rejected";
      description = "There was an issue with your submitted documents. Please review them and make necessary corrections.";
    } else if (isProfileNone) {
      alertClasses = "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300";
      IconComponent = FileText;
      title = "Complete Your Driver Profile";
      description = "To start offering rides, please complete your driver profile by uploading the required documents.";
    } else {
      console.warn("Unhandled driverStatus in renderProfileAlert:", currentUser.driverStatus);
      return (
        <Alert variant="default">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-semibold">Profile Status Unknown</AlertTitle>
          <AlertDescription>
            Your driver profile status is currently undetermined. Please contact support if this persists.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert variant={alertVariant} className={alertClasses}>
        <IconComponent className="h-5 w-5" />
        <AlertTitle className="font-semibold">{title}</AlertTitle>
        <AlertDescription className="space-y-2">
          {description}
          {(isProfilePending || needsProfileAttention) && (
             <div className="mt-2">
              <Button asChild variant="outline" size="sm">
                <Link href={alertButtonLink}>
                  <FileText className="mr-2 h-4 w-4" />
                  {alertButtonText}
                </Link>
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="flex h-screen">
      <DriverNavigationSidebar initialUser={currentUser} />
      <main className="flex-grow p-6 md:p-8 lg:p-10 space-y-8 overflow-y-auto">
        <header className="mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            Driver Dashboard
          </h1>
          <p className="text-lg text-muted-foreground dark:text-gray-400">
            Hello {currentUser.firstName || currentUser.username || 'Driver'}, manage your rides and earnings here.
          </p>
        </header>
        {renderProfileAlert()}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 ${!isProfileApproved ? 'opacity-50 pointer-events-none' : ''}`}>
          <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <CardHeader className="pb-4">
               <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-semibold">Offer a New Ride</CardTitle>
                  <PlusCircle className="h-8 w-8 text-green-500" />
              </div>
              <CardDescription className="pt-1">Create a new ride offer for passengers to book.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-4">Set your departure and destination, date, time, available seats, and price per seat.</p>
            </CardContent>
            <CardFooter>
              <Button asChild size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={!isProfileApproved}>
                <Link href="/driver/offer-ride"><PlusCircle className="mr-2 h-5 w-5" /> Create Ride Offer</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-2xl font-semibold">Quick Action</CardTitle>
              <CardDescription className="pt-1">Instantly access key features.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center p-4">
              <Button asChild variant="default" className="w-28 h-28 rounded-full bg-sky-600 hover:bg-sky-700 text-white shadow-xl transform transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 flex items-center justify-center" disabled={!isProfileApproved} aria-label="Quick Action">
                <Link href="/driver/quick-start"><Navigation className="w-12 h-12" /></Link>
              </Button>
            </CardContent>
            <CardFooter className="pt-3 justify-center"><p className="text-xs text-muted-foreground text-center">e.g., View map, start predefined route</p></CardFooter>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-semibold">Manage My Rides</CardTitle>
                  <ListOrdered className="h-8 w-8 text-blue-500" />
              </div>
              <CardDescription className="pt-1">View, update, or cancel your scheduled rides. Manage booking requests.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-4">Oversee all your active and past ride offers. Confirm or reject passenger booking requests, and manage the lifecycle of your rides.</p>
            </CardContent>
            <CardFooter>
              <Button asChild size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={!isProfileApproved}>
                <Link href="/driver/my-rides"><ListOrdered className="mr-2 h-5 w-5" /> View My Offered Rides</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;