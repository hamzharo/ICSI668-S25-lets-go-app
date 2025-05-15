// frontend/app/(root)/driver/layout.tsx
import React from 'react';
import { User } from '@/types';
import { redirect } from 'next/navigation';
import DriverNavigationSidebar from '@/components/sidebars/DriverNavigationSidebar'; // Ensure this path is correct

// Your actual server-side function to get the current user
async function getCurrentUser(): Promise<User | null> {

  console.log("DriverLayout: Fetching current user (server-side)...");

  return null; // Return null if not authenticated or not a driver
}

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser(); // Renamed to currentUser for clarity

  if (!currentUser) {
    // This means user is not authenticated, or not authorized for the driver section.
    console.log("DriverLayout: No authorized user found, redirecting to login.");
    redirect('/login'); // Redirect if no user (MUST be called outside try/catch)
    // Note: redirect() throws an error, so code below it won't run.
  }


  console.log("DriverLayout: Authorized user fetched successfully for layout:", currentUser.firstName);

  return (
    <div className="flex h-screen bg-background"> {/* Main container for sidebar + content */}
      {/* Render the DriverNavigationSidebar and pass the server-fetched user */}
      <DriverNavigationSidebar initialUser={currentUser} />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"> {/* Main content area */}
   \
          {children}
      </main>
    </div>
  );
}