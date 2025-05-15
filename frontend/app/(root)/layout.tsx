
// frontend/app/(root)/layout.tsx  <- NEW FILE
import Sidebar from "@/components/Sidebar"; // Import your Sidebar
// import MobileNav from "@/components/MobileNav"; // Import MobileNav if you have one
import React from "react";
import Image from "next/image";
import '../globals.css';
import Header from '@/components/sidebars/Header';

const getMockUserData = () => {

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

    
    const loggedInUser = getMockUserData();

    return (
        
        <main className="flex h-screen w-full font-inter">
            {/* Desktop Sidebar */}
            {/* <Sidebar user={loggedInUser} /> */}
            {/* <RightSidebar /> */}
            
            <div className="flex size-full flex-col">
                {/* Mobile Nav */}
                <Header />
                {/* <div className="root-layout">
                    <Image src="/icons/logo.png" width={30} height={30} alt="logo" />
                    <div>
                        <MobileNav user={loggedInUser} />
                    </div>
                </div> */}
                {/* Main content area for the page */}
                {children}
            </div>

            {/* Right Sidebar (Optional - if it's part of the standard auth layout) */}
            {/* <RightSidebar user={loggedInUser} /> */}

            {/* Note: The Authenticated Footer with logout is likely INSIDE the Sidebar component already */}
        </main>
    );
}