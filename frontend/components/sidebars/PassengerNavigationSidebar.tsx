
// frontend/components/navigation/PassengerNavigationSidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, // Dashboard
  Search,         // Find a Ride
  ListChecks,     // My Bookings
  UserCog,        // Edit Profile (or just User for simpler icon)
  CreditCard,     // Payment Methods (example)
  Settings,       // Settings
  LifeBuoy,       // Support
  LogOut,         // Logout
  ChevronRight,
  Camera,          // For profile picture change
  Mail,           // << NEW: For Inbox
  Car,            // << NEW: For Become a Driver (or SteeringWheel, UserPlus etc.)
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/AuthContext'; // IMPORT YOUR AUTH CONTEXT HOOK

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  currentPath: string;
}

// Reusable NavItem component (can be shared if identical or customized)
const NavItem = ({ href, icon: Icon, label, currentPath }: NavItemProps) => {
  // Adjusted isActive logic for passenger routes
  const isExactlyDashboard = href === "/passenger/dashboard" && currentPath === "/passenger/dashboard";
  const isSubPath = currentPath.startsWith(href) && href !== "/passenger/dashboard";
  const isActive = isExactlyDashboard || isSubPath;


  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150
                  ${isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
    >
      <Icon className="mr-3 h-5 w-5" />
      <span>{label}</span>
      {isActive && <ChevronRight className="ml-auto h-4 w-4 text-primary-foreground/70" />}
    </Link>
  );
};

interface PassengerNavigationSidebarProps {
  initialUser: User;
}

const PassengerNavigationSidebar = ({ initialUser }: PassengerNavigationSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user: contextUser, logoutUser, isLoading: authIsLoading } = useAuth();

  // Determine the user to display (same logic as DriverNavigationSidebar)
  const effectiveUser = contextUser !== undefined ? contextUser : initialUser;

  const handleActualLogout = async () => {
    console.log("PassengerNavigationSidebar: Logout clicked");
    if (logoutUser) {
      await logoutUser();
    }
    router.push('/login');
  };

  // Define navigation items for Passengers
  const navItems = [
    // { href: '/passenger/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/search-rides', icon: Search, label: 'Find a Ride' },
    { href: '/my-bookings', icon: ListChecks, label: 'My Bookings' },
    { href: '/passenger/inbox', icon: Mail, label: 'Inbox' }, // << NEW
    // { href: '/passenger/edit-profile', icon: UserCog, label: 'Edit Profile' },
    // Optional: Add more passenger-specific items like Ride History
    // { href: '/passenger/ride-history', icon: History, label: 'Ride History' },
    { href: '/passenger/become-driver', icon: Car, label: 'Become a Driver' }, // << NEW (adjust href as needed)
  ];

  const accountItems = [
    { href: '/passenger/settings', icon: Settings, label: 'Settings' },
    // Optional:
    // { href: '/passenger/payment-methods', icon: CreditCard, label: 'Payment Methods' },
    { href: '/passenger/support', icon: LifeBuoy, label: 'Support' },
  ];


  if (authIsLoading && !initialUser) {
    return (
        <aside className="flex flex-col w-64 bg-card border-r border-border h-full text-card-foreground shrink-0 p-4">
            <p>Loading user information...</p>
        </aside>
    );
  }

  if (!effectiveUser) {
    return (
        <aside className="flex flex-col w-64 bg-card border-r border-border h-full text-card-foreground shrink-0 p-4">
            <p>User not logged in.</p>
            <Button onClick={() => router.push('/login')} className="mt-4">Login</Button>
        </aside>
    );
  }

  return (
    <aside className="flex flex-col w-64 bg-card border-r border-border h-full text-card-foreground shrink-0">
      <div className="p-4 flex flex-col items-center space-y-3 border-b border-border">
        <div className="relative group">
            <Avatar className="h-24 w-24 cursor-pointer">
                <AvatarImage src={effectiveUser.profilePictureUrl || undefined} alt={effectiveUser.firstName || 'User'} />
                <AvatarFallback className="text-3xl">
                {effectiveUser.firstName?.[0]?.toUpperCase()}
                {effectiveUser.lastName?.[0]?.toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <Link
                href="/passenger/edit-profile#profile-picture" // Link to specific section for profile pic
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                aria-label="Change profile picture"
            >
                <Camera className="h-8 w-8 text-white" />
            </Link>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold">{effectiveUser.firstName} {effectiveUser.lastName}</h2>
          <p className="text-xs text-muted-foreground">{effectiveUser.email}</p>
        </div>
      </div>

      <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
        <p className="px-3 py-1 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Main Menu</p>
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} currentPath={pathname} />
        ))}
        <Separator className="my-4" />
        <p className="px-3 py-1 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Account</p>
        {accountItems.map((item) => (
          <NavItem key={item.href} {...item} currentPath={pathname} />
        ))}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={handleActualLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default PassengerNavigationSidebar;