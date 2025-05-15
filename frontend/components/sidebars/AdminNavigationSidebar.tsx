// frontend/components/navigation/AdminNavigationSidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, // Dashboard
  FileCheck2,     // Document Verification
  Files,          // All Documents
  Users,          // User Management
  ShieldCheck,    // Could represent security, roles, or system integrity
  Settings,       // System Settings
  // BarChart3,      // Analytics/Reports
  // LifeBuoy,       // Support (if applicable)
  LogOut,         // Logout
  ChevronRight,
  Car            // Ride Management (example)
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/AuthContext';

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  currentPath: string;
}

// Reusable NavItem component (can be shared or slightly customized)
const NavItem = ({ href, icon: Icon, label, currentPath }: NavItemProps) => {
  // isActive logic for admin routes
  const isExactlyDashboard = href === "/admin/dashboard" && currentPath === "/admin/dashboard";
  const isSubPath = currentPath.startsWith(href) && href !== "/admin/dashboard";
  const isActive = isExactlyDashboard || isSubPath;

  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150
                  ${isActive
                    ? 'bg-primary text-primary-foreground shadow-sm' // Or a distinct admin primary color
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
    >
      <Icon className="mr-3 h-5 w-5" />
      <span>{label}</span>
      {isActive && <ChevronRight className="ml-auto h-4 w-4 text-primary-foreground/70" />}
    </Link>
  );
};

interface AdminNavigationSidebarProps {
  initialUser: User; // Admin user data
}

const AdminNavigationSidebar = ({ initialUser }: AdminNavigationSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user: contextUser, logoutUser, isLoading: authIsLoading } = useAuth();

  const effectiveUser = contextUser !== undefined ? contextUser : initialUser;

  const handleActualLogout = async () => {
    if (logoutUser) {
      await logoutUser();
    }
    router.push('/login'); // Or a specific admin login page
  };

  // Define navigation items for Admins
  const mainNavItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/document-review', icon: FileCheck2, label: 'Document Review' },
    { href: '/admin/all-documents', icon: Files, label: 'All Documents' },
    { href: '/admin/users', icon: Users, label: 'User Management' },
    // Optional:
    // { href: '/admin/rides', icon: Car, label: 'Ride Oversight' },
    // { href: '/admin/reports', icon: BarChart3, label: 'Reports & Analytics' },
  ];

  const systemNavItems = [
    { href: '/admin/system-settings', icon: Settings, label: 'System Settings' },
    // Optional:
    // { href: '/admin/support-tickets', icon: LifeBuoy, label: 'Support Tickets' },
    // { href: '/admin/audit-logs', icon: ShieldCheck, label: 'Audit Logs' },
  ];

  if (authIsLoading && !initialUser) {
    return (
        <aside className="flex flex-col w-64 bg-card border-r border-border h-full text-card-foreground shrink-0 p-4">
            <p>Loading admin information...</p>
        </aside>
    );
  }

  if (!effectiveUser || !effectiveUser.roles?.includes('ADMIN')) {
    // This sidebar should only be rendered for admins.
    // The layout protecting admin routes should handle redirection.
    console.warn("AdminNavigationSidebar: No effective admin user. This component might be rendered incorrectly.");
    return (
        <aside className="flex flex-col w-64 bg-card border-r border-border h-full text-card-foreground shrink-0 p-4">
            <p>Access Denied or User not Admin.</p>
            <Button onClick={() => router.push('/')} className="mt-4">Go to Home</Button>
        </aside>
    );
  }

  return (
    <aside className="flex flex-col w-72 bg-gray-800 text-gray-100 h-full shrink-0"> {/* Example: Darker theme for admin */}
      <div className="p-5 flex flex-col items-center space-y-3 border-b border-gray-700">
        <Avatar className="h-24 w-24">
          <AvatarImage src={effectiveUser.profilePictureUrl || undefined} alt={effectiveUser.firstName || 'Admin'} />
          <AvatarFallback className="text-3xl bg-gray-600 text-gray-50">
            A
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-lg font-semibold">{effectiveUser.firstName} {effectiveUser.lastName}</h2>
          <p className="text-xs text-gray-400">{effectiveUser.email}</p>
          <span className="mt-1 inline-block px-2 py-0.5 text-xs font-semibold bg-red-600 text-white rounded-full">
            Administrator
          </span>
        </div>
      </div>

      <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
        <p className="px-3 py-1 text-xs font-semibold text-gray-400/80 uppercase tracking-wider">Main Tools</p>
        {mainNavItems.map((item) => (
          <NavItem key={item.href} {...item} currentPath={pathname} />
        ))}
        <Separator className="my-4 border-gray-700" />
        <p className="px-3 py-1 text-xs font-semibold text-gray-400/80 uppercase tracking-wider">System</p>
        {systemNavItems.map((item) => (
          <NavItem key={item.href} {...item} currentPath={pathname} />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700 mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-red-700/20 hover:text-red-400"
          onClick={handleActualLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default AdminNavigationSidebar;