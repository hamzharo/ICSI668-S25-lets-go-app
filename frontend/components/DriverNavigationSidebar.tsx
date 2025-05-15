// frontend/components/navigation/DriverNavigationSidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from '@/types'; // Assuming User type is in @/types
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Car,
  ListOrdered,
  UserCog,
  FileUp,
  Settings,
  LifeBuoy,
  Camera,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Placeholder for logout function - you'll need to implement this
const handleLogout = async () => {
  console.log("Logout clicked");
  // Add your actual logout logic here (e.g., call an API, clear tokens)
  // await signOut(); // if using NextAuth.js
  // router.push('/login');
};

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  currentPath: string;
}

const NavItem = ({ href, icon: Icon, label, currentPath }: NavItemProps) => {
  const isActive = currentPath === href || (href !== "/driver/dashboard" && currentPath.startsWith(href));
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


interface DriverNavigationSidebarProps {
  user: User;
  // You might pass a function to close the sidebar on mobile
  // onClose?: () => void;
}

const DriverNavigationSidebar = ({ user }: DriverNavigationSidebarProps) => {
  const pathname = usePathname(); // To highlight the active link

  const navItems = [
    { href: '/driver/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/driver/offer-ride', icon: Car, label: 'Offer Ride' },
    { href: '/driver/my-rides', icon: ListOrdered, label: 'My Rides' },
    { href: '/driver/edit-profile', icon: UserCog, label: 'Edit Profile' },
    { href: '/driver/upload-documents', icon: FileUp, label: 'Upload Documents' },

    
  ];

  const accountItems = [
    { href: '/driver/settings', icon: Settings, label: 'Settings' },
    { href: '/driver/support', icon: LifeBuoy, label: 'Support' },
  ];

  return (
    <aside className="flex flex-col w-64 bg-card border-r border-border h-full text-card-foreground">
      {/* Profile Section */}
      <div className="p-4 flex flex-col items-center space-y-3 border-b border-border">
        <div className="relative group">
          <Avatar className="h-24 w-24 cursor-pointer">
            <AvatarImage src={user.profilePictureUrl || undefined} alt={user.firstName || 'User'} />
            <AvatarFallback className="text-3xl">
              {user.firstName?.[0]?.toUpperCase()}
              {user.lastName?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Link
            href="/driver/edit-profile#profile-picture" // Link to a specific section on edit profile page
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Change profile picture"
          >
            <Camera className="h-8 w-8 text-white" />
          </Link>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold">{user.firstName} {user.lastName}</h2>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Navigation Links */}
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

      {/* Footer/Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default DriverNavigationSidebar;