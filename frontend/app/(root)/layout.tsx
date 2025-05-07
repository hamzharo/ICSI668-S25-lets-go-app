
// frontend/app/(root)/layout.tsx  <- NEW FILE
import Sidebar from "@/components/Sidebar"; // Import your Sidebar
import RightSidebar from "@/components/RightSidebar"; // Import RightSidebar if needed here
import MobileNav from "@/components/MobileNav"; // Import MobileNav if you have one
import React from "react";
import Image from "next/image";
import '../globals.css';

// Helper function (example - replace with your actual logic)
// This needs to run server-side or client-side depending on how you manage auth state
// For simplicity, we'll use a placeholder here.
// In reality, you'd likely fetch this in a server component or read from context/localStorage client-side
const getMockUserData = () => {
    // !! REPLACE THIS MOCK WITH YOUR ACTUAL USER DATA FETCHING !!
    // This might involve reading cookies server-side or using a client-side hook/provider
    console.warn("Using mock user data in app/(root)/layout.tsx");
    return {
        userId: 'mock123',
        firstName: 'User',
        lastName: 'Test',
        emailId: 'user@example.com'
        // Add other necessary user fields
    };
}

export default function AuthenticatedRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {

    // --- Get Logged In User Data ---
    // NOTE: How you get the user data here depends heavily on your auth setup.
    // Middleware only checks *if* a token exists, not *who* the user is.
    // Option A (Server Component Layout): Fetch user server-side based on cookie/session.
    // Option B (Client Component Layout): Use 'use client' and fetch user data via useEffect/hook.
    // We'll use a mock function for now. Replace this!
    const loggedInUser = getMockUserData();
    // --- End User Data ---


    return (
        <main className="flex h-screen w-full font-inter">
            {/* Desktop Sidebar */}
            <Sidebar user={loggedInUser} />
            {/* <RightSidebar /> */}

            <div className="flex size-full flex-col">
                {/* Mobile Nav */}
                <div className="root-layout"> {/* Assuming this class handles mobile header layout */}
                    <Image src="/icons/logo.png" width={30} height={30} alt="logo" />
                    <div>
                        <MobileNav user={loggedInUser} />
                    </div>
                </div>
                {/* Main content area for the page */}
                {children}
            </div>

            {/* Right Sidebar (Optional - if it's part of the standard auth layout) */}
            {/* <RightSidebar user={loggedInUser} /> */}

            {/* Note: The Authenticated Footer with logout is likely INSIDE the Sidebar component already */}
        </main>
    );
}