// // For demo, keeping as Server Component for simplicity, passing mock data.
// 'use client';

// import React from 'react';
// import SystemSettingsForm from '@/components/admin/SystemSettingsForm' 
// import { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: 'System Settings (Admin Demo)',
//   description: 'Manage platform-wide configurations and settings.',
// };

// // Define the shape of the data (same as in SystemSettingsForm.tsx)
// interface MockSystemSettingsData {
//   siteName: string;
//   maintenanceMode: boolean;
//   defaultCurrency: string;
//   maxUploadSizeMB: number;
//   emailNotificationsEnabled: boolean;
//   adminEmail: string;
//   driverVerificationRequired: boolean;
//   baseCommissionRate: number;
// }

// // Function to get mock data
// const getMockSystemSettings = async (): Promise<MockSystemSettingsData> => {
//   console.log("DEMO PAGE: Fetching MOCK system settings for /admin/system-settings...");
//   await new Promise(resolve => setTimeout(resolve, 100));

//   return {
//     siteName: 'Our Awesome RideShare (Demo)',
//     maintenanceMode: false,
//     defaultCurrency: 'USD',
//     maxUploadSizeMB: 5,
//     emailNotificationsEnabled: true,
//     adminEmail: 'sysadmin@example-rides.com',
//     driverVerificationRequired: true,
//     baseCommissionRate: 12.5,
//   };
// };

// const SystemSettingsPage = async () => {
//   // In a real scenario, you'd implement robust admin authentication and authorization here
//   // using getCurrentUser() and checking the user's role.
//   // For this demo, we are bypassing that.
//   // Example (if you had getCurrentUser and it worked):
//   // const adminUser = await getCurrentUser();
//   // if (!adminUser || adminUser.role !== 'ADMIN') {
//   //   redirect('/login?message=admin_only_access_denied');
//   // }

//   const mockSettingsData = await getMockSystemSettings();

//   return (
//     <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-3xl">
//       <header className="mb-8 text-center">
//         <h1 className="text-3xl font-bold tracking-tight text-foreground">System Settings (DEMO)</h1>
//         <p className="text-lg text-muted-foreground mt-2">
//           Configure global parameters for the platform. (Changes are not saved in demo)
//         </p>
//       </header>

//       <SystemSettingsForm initialSettings={mockSettingsData} />
//     </div>
//   );
// };

// export default SystemSettingsPage;


// frontend/app/(root)/admin/system-settings/page.tsx
// NO 'use client'; directive here


// 'use client';
import React from 'react';
import SystemSettingsForm from '@/components/admin/SystemSettingsForm';
import { Metadata } from 'next'; // This is fine in a Server Component

export const metadata: Metadata = { // This is fine in a Server Component
  title: 'System Settings (Admin Demo)',
  description: 'Manage platform-wide configurations and settings.',
};

interface MockSystemSettingsData {
  siteName: string;
  maintenanceMode: boolean;
  defaultCurrency: string;
  maxUploadSizeMB: number;
  emailNotificationsEnabled: boolean;
  adminEmail: string;
  driverVerificationRequired: boolean;
  baseCommissionRate: number;
}

const getMockSystemSettings = async (): Promise<MockSystemSettingsData> => {
  console.log("DEMO PAGE: Fetching MOCK system settings for /admin/system-settings...");
  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    siteName: 'Our Awesome RideShare (Demo)',
    maintenanceMode: false,
    defaultCurrency: 'USD',
    maxUploadSizeMB: 5,
    emailNotificationsEnabled: true,
    adminEmail: 'sysadmin@example-rides.com',
    driverVerificationRequired: true,
    baseCommissionRate: 12.5,
  };
};

const SystemSettingsPage = async () => { // 'async' is fine for Server Components
  const mockSettingsData = await getMockSystemSettings();

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-3xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">System Settings (DEMO)</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Configure global parameters for the platform. (Changes are not saved in demo)
        </p>
      </header>
      {/* SystemSettingsForm is a Client Component, which is fine to render from a Server Component */}
      <SystemSettingsForm initialSettings={mockSettingsData} />
    </div>
  );
};

export default SystemSettingsPage;