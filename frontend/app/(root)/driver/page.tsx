// frontend/app/(root)/driver/dashboard/page.tsx
import React from 'react';
import DriverDashboard from '@/components/dashboards/DriverDashboard';
import { User } from '@/types'; // Path to your types
// import { redirect } from 'next/navigation'; // For redirecting if necessary

// Helper function to get current user - replace with your actual auth logic
// This logic might be redundant if layout already fetches it and can pass it down,
// but for page-specific needs or if layout doesn't pass it, it's fine.
// Ensure it's consistent with the layout's user fetching.
async function getCurrentUser(): Promise<User | null> {
  // In a real app, fetch this from your auth system
  // For demonstration, returning a mock user:
  try {
    // const session = await getServerSession(authOptions); // Example for NextAuth.js
    // if (!session?.user) return null;
    // return session.user as User; // Adjust to match your User type structure

    // Mock user data (should be consistent with layout or fetched once):
    return {
      id: 'driver123',
      firstName: 'Driver',
      lastName: 'User',
      email: 'driver@example.com',
      profilePictureUrl: 'https://via.placeholder.com/150/007bff/FFFFFF?Text=D',
      driverStatus: 'APPROVED', // Try: 'PENDING_APPROVAL', 'REJECTED', 'NONE'
    };
  } catch (error) {
    console.error("Error fetching current user for dashboard page:", error);
    return null;
  }
}

export default async function DriverDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    // Or use redirect('/login') if user is not found/authenticated
    return (
        <div className="flex items-center justify-center h-full p-8">
            <p>User data not available or you are not authorized. Please try logging in.</p>
        </div>
    );
  }

  return (
    <DriverDashboard user={user} />
  );
}