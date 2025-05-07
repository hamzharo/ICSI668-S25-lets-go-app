// frontend/app/(root)/page.tsx
'use client';

import { useAuth } from '@/lib/AuthContext';
import AdminDashboard from '@/components/dashboards/AdminDashboard';   // Correct import
import DriverDashboard from '@/components/dashboards/DriverDashboard'; // Correct import
import PassengerDashboard from '@/components/dashboards/PassengerDashboard'; // Correct import
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react'; // Suspense is here but not strictly needed for this basic setup

// These imports are incorrect for THIS page's designed purpose.
// They belong on their own specific pages or are named differently.
// import RideButton from "@/components/RideButton"; // If you created RideButton.tsx, this might be used WITHIN dashboards, not directly here.
// import CreateRideForm from "@/components/CreateRideForm"; // This functionality is in OfferRideForm.tsx on its own page.
// import RequestRideForm from "@/components/RequestRideForm"; // This functionality is in RideSearchForm.tsx on its own page.
// import UpdateRideForm from "@/components/UpdateRideForm"; // This functionality is in EditRideForm.tsx on its own page.


export default function MainDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login'); // Redirect unauthenticated users
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) { // Show loader if auth is still loading OR if no user (even after auth load)
    return (
      <div className="flex flex-grow items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Render the appropriate dashboard based on user role
  switch (user.role) {
    case 'PASSENGER':
      return <PassengerDashboard user={user} />;
    case 'DRIVER':
      return <DriverDashboard user={user} />;
    case 'ADMIN':
      return <AdminDashboard user={user} />;
    default:
      console.error("Unknown user role in MainDashboardPage:", user.role);
      return (
        <div className="p-6 text-center text-red-600 dark:text-red-400">
          Error: Invalid user role. Please contact support.
        </div>
      );
  }
}