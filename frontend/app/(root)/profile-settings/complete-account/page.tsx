// 'use client'; // Make it a client component if you need client-side hooks like useAuth immediately
// For demo, keeping as Server Component and passing mock data is simpler to avoid auth complexity FOR THIS PAGE
import React from 'react';
import DriverCompleteAccountForm from '@/components/driver/DriverCompleteAccountForm';
import { Metadata } from 'next';
// import { User } from '@/types'; // Not strictly needed if we mock all data directly
// import { getCurrentUser } from '@/lib/auth/actions'; // Temporarily bypass for demo
// import { redirect } from 'next/navigation'; // Temporarily bypass for demo

export const metadata: Metadata = {
  title: 'Complete Driver Profile (Demo)',
  description: 'Finalize your driver account details to start offering rides.',
};

// Define the shape of the data needed by DriverCompleteAccountForm
interface MockDriverCompletionData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleLicensePlate?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  drivingLicenseStatus?: 'UPLOADED' | 'PENDING' | 'VERIFIED' | 'MISSING';
}

// Function to get mock data (simulates fetching from backend for a specific user)
const getMockDriverCompletionData = async (/* userId: string */): Promise<MockDriverCompletionData> => {
  // Simulate fetching user and their driver profile data
  console.log("Fetching MOCK driver completion data for demo...");
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate delay

  // Example: Some data filled, some missing
  return {
    firstName: 'DemoDriver',
    lastName: 'User',
    email: 'driver.demo@example.com', // Usually from User object
    phoneNumber: '+1234567890', // Partially filled personal
    vehicleMake: 'DemoCar',          // Partially filled vehicle
    vehicleModel: 'ModelX',
    // vehicleYear: undefined,
    // vehicleLicensePlate: undefined,
    // bankAccountName: undefined,    // Banking info missing
    // bankAccountNumber: undefined,
    // bankRoutingNumber: undefined,
    drivingLicenseStatus: 'PENDING', // License pending
  };
};


const CompleteAccountPage = async () => {
  // --- For a real page, you'd fetch the current user ---
  // const user = await getCurrentUser();
  // if (!user || user.role !== 'DRIVER') {
  //   redirect('/login?message=unauthorized');
  // }
  // --- End real user fetching ---

  // For demo, we call our mock data function
  // Pass a mock user ID or no ID if the mock function doesn't use it
  const mockData = await getMockDriverCompletionData(/* user?.id */);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-3xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Complete Your Driver Profile (Demo)</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Please provide the remaining information to activate your driver account.
        </p>
      </header>

      <DriverCompleteAccountForm initialDriverData={mockData} />
    </div>
  );
};

export default CompleteAccountPage;