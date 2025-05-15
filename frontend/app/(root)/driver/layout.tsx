// frontend/app/(root)/driver/layout.tsx
import React from 'react';
import { User } from '@/types';
import { redirect } from 'next/navigation';
import DriverNavigationSidebar from '@/components/sidebars/DriverNavigationSidebar'; // Ensure this path is correct
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const USER_ME_ENDPOINT = '/api/users/me';
const AUTH_COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'your_auth_token_cookie_name';

// Your actual server-side function to get the current user
async function getCurrentUser(): Promise<User | null> {

  console.log("DriverLayout: Fetching current user (server-side)...");

  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if(!token) {
    console.log("DriverLayout: No auth token found in cookies.");
    return null;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${USER_ME_ENDPOINT}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Important for dynamic data that should not be cached across requests
    });

    if (response.ok) {
      const userData: User = await response.json();
      console.log("DriverLayout: User fetched successfully from API:", userData.email); // Or name/ID

      // SERVER-SIDE CHECK: Ensure user is a DRIVER and APPROVED
      // This is crucial for protecting the /driver route group
      if (!userData.roles || !userData.roles.includes('DRIVER')) {
        console.log("DriverLayout: User is not a DRIVER. Denying access to driver layout.");
        return null; // Or throw an error / redirect to an 'unauthorized' page
      }
      return userData;
    } else {
      console.error("DriverLayout: Failed to fetch user details from API:", response.status, await response.text());
      return null;
    }
  } catch (error) {
    console.error("DriverLayout: Error fetching/processing user:", error);
    return null;
  }
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
          {children}
      </main>
    </div>
  );
}