// frontend/components/layout/Header.tsx (or a similar path like components/ui/Header.tsx)
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // If you have a logo image
import { useRouter } from 'next/navigation';
import { Home, LogOut, UserCircle } from 'lucide-react'; // UserCircle for when user is not logged in
import { useAuth } from '@/lib/AuthContext'; // Assuming this is your auth context hook
import { Button } from '@/components/ui/button'; // Assuming you use shadcn/ui Button

const Header = () => {
  const { user, logoutUser, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (logoutUser) {
      await logoutUser(); // This should clear context and tokens
    }
    // AuthContext's logoutUser should ideally handle redirection.
    // If not, or for an extra layer of certainty:
    router.push('/login'); // Redirect to login page after logout
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        {/* App Logo and Name */}
        <Link href="/" className="flex items-center space-x-2" aria-label="Let's Go Home">
          {/* Option 1: Image Logo */}
          <Image
            src="/icons/logo.png" // ACTION: Replace with your actual logo path
            width={40}
            height={40}
            alt="Let's Go Logo"
            className="h-8 w-8 md:h-10 md:w-10" // Responsive sizing
          />
          {/* Option 2: Text Logo (if no image) */}
          {/* <CarFront className="h-8 w-8 text-primary" /> */}
          <span className="text-xl md:text-2xl font-bold text-foreground hidden sm:inline-block">
            Let's Go
          </span>
        </Link>

        {/* Navigation and Actions */}
        <nav className="flex items-center space-x-4 md:space-x-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center"
            aria-label="Home"
          >
            <Home className="mr-1.5 h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div> // Placeholder for loading state
          ) : user ? (
            // User is logged in
            <>
              {/* Optional: Link to User Profile/Dashboard */}
              {/* <Link href={user.roles?.includes('DRIVER') ? "/driver/dashboard" : "/passenger/dashboard"}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center"
              >
                <UserCircle className="mr-1.5 h-5 w-5 sm:mr-2" />
                <span>{user.firstName || 'Profile'}</span>
              </Link> */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-sm font-medium text-muted-foreground hover:text-destructive flex items-center"
                aria-label="Logout"
              >
                <LogOut className="mr-1.5 h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            // User is not logged in
            <>
              <Link href="/login" legacyBehavior passHref>
                <Button variant="outline" size="sm" className="text-sm">
                  Login
                </Button>
              </Link>
              <Link href="/register" legacyBehavior passHref>
                <Button variant="default" size="sm" className="text-sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;