// frontend/app/(root)/page.tsx
'use client';

import { useAuth } from '@/lib/AuthContext';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import DriverDashboard from '@/components/dashboards/DriverDashboard';
import PassengerDashboard from '@/components/dashboards/PassengerDashboard';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/types'; // UserRole will be 'PASSENGER' | 'DRIVER' | 'ADMIN'

export default function MainDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      console.log("[MainDashboardPage] useEffect: No user found after auth loading, redirecting to login.");
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex flex-grow items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading user session...</p>
      </div>
    );
  }

  let primaryRole: UserRole | undefined = undefined;

  if (user.roles && user.roles.length > 0) {
    // Assuming roles from /me are now 'ADMIN', 'DRIVER', 'PASSENGER' (uppercase, no prefix)
    if (user.roles.includes('ADMIN')) {
      primaryRole = 'ADMIN';
    } else if (user.roles.includes('DRIVER')) {
      primaryRole = 'DRIVER';
    } else if (user.roles.includes('PASSENGER')) {
      primaryRole = 'PASSENGER';
    }
  }
  
  console.log("[MainDashboardPage] User object:", JSON.stringify(user)); // Stringify for better array visibility
  console.log("[MainDashboardPage] Determined primary role:", primaryRole);

  switch (primaryRole) {
    case 'PASSENGER': // Matches new UserRole type
      return <PassengerDashboard user={user} />;
    case 'DRIVER':    // Matches new UserRole type
      return <DriverDashboard user={user} />;
    case 'ADMIN':     // Matches new UserRole type
      return <AdminDashboard user={user} />;
    default:
      console.error("[MainDashboardPage] No recognizable primary role found. User roles:", user.roles);
      return (
        <div className="p-6 text-center">
          <h1 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
            Error: Invalid or Unassigned User Role
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            We could not determine a valid role for your account to display the appropriate dashboard.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-2">
            Please contact support if you believe this is an error.
          </p>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <p>User ID: {user.id}</p>
            <p>Detected Roles: {user.roles && user.roles.length > 0 ? user.roles.join(', ') : 'No roles assigned'}</p>
          </div>
        </div>
      );
  }
}