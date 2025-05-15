// // frontend/components/navigation/DriverNavigationSidebar.tsx
// 'use client';

// import React, { useState, useEffect, useMemo } from 'react'; // Import useMemo
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { User } from '@/types';
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from '@/components/ui/button';
// import * as AccordionPrimitive from "@radix-ui/react-accordion";
// import { cn } from "@/lib/utils";

// import {
//   Car,
//   ListOrdered,
//   DollarSign,
//   UserCog,
//   FileUp,
//   Settings,
//   LifeBuoy,
//   Inbox,
//   History,
//   LogOut,
//   ChevronRight,
//   ChevronDown,
//   Camera
// } from 'lucide-react';

// import { useAuth } from '@/lib/AuthContext';

// interface NavItemProps {
//   href: string;
//   icon?: React.ElementType;
//   label: string;
//   currentPath: string;
//   isSubItem?: boolean;
// }

// const NavItem = ({ href, icon: Icon, label, currentPath, isSubItem }: NavItemProps) => {
//   const isActive = currentPath === href || (href !== '/driver' && currentPath.startsWith(href));

//   return (
//     <Link
//       href={href}
//       className={cn(
//         `flex items-center py-2.5 text-sm font-medium rounded-md transition-colors duration-150 w-full`,
//         isSubItem ? 'px-6 hover:bg-accent/50' : 'px-3 hover:bg-accent',
//         isActive
//           ? (isSubItem ? 'text-primary font-semibold' : 'bg-primary text-primary-foreground shadow-sm')
//           : 'text-muted-foreground'
//       )}
//     >
//       {Icon && <Icon className={cn("h-5 w-5", isSubItem ? "mr-2" : "mr-3")} />}
//       <span>{label}</span>
//       {isActive && !isSubItem && <ChevronRight className="ml-auto h-4 w-4 text-primary-foreground/70" />}
//     </Link>
//   );
// };

// interface AccordionNavGroupProps {
//   triggerLabel: string;
//   triggerIcon: React.ElementType;
//   items: Array<Omit<NavItemProps, 'currentPath' | 'isSubItem'>>;
//   currentPath: string;
//   value: string;
// }

// const AccordionNavGroup = ({ triggerLabel, triggerIcon: TriggerIcon, items, currentPath, value }: AccordionNavGroupProps) => {
//   const isAnySubItemActive = items.some(item => currentPath === item.href || (item.href !== '/driver' && currentPath.startsWith(item.href)));

//   return (
//     <AccordionPrimitive.Item value={value} className="border-b border-border/50 last:border-b-0">
//       <AccordionPrimitive.Header>
//         <AccordionPrimitive.Trigger
//           className={cn(
//             "flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-md transition-all hover:bg-accent group",
//             isAnySubItemActive ? "text-primary font-semibold" : "text-foreground"
//           )}
//         >
//           <div className="flex items-center">
//             <TriggerIcon className="mr-3 h-5 w-5" />
//             <span>{triggerLabel}</span>
//           </div>
//           <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
//         </AccordionPrimitive.Trigger>
//       </AccordionPrimitive.Header>
//       <AccordionPrimitive.Content
//         className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
//       >
//         <div className="pt-1 pb-2 space-y-0.5">
//           {items.map((item) => (
//             <NavItem key={item.href} {...item} currentPath={currentPath} isSubItem />
//           ))}
//         </div>
//       </AccordionPrimitive.Content>
//     </AccordionPrimitive.Item>
//   );
// };

// interface DriverNavigationSidebarProps {
//   initialUser: User;
// }

// const DriverNavigationSidebar = ({ initialUser }: DriverNavigationSidebarProps) => {
//   const pathname = usePathname();
//   const router = useRouter();
//   const { user: contextUser, logoutUser, isLoading: authIsLoading } = useAuth();
//   const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);

//   const effectiveUser = contextUser !== undefined ? contextUser : initialUser;

//   const handleActualLogout = async () => {
//     if (logoutUser) { await logoutUser(); }
//     router.push('/login');
//   };

//   const navGroups = useMemo(() => [ // Memoize navGroups
//     { value: "ride-management", triggerLabel: "Ride Management", triggerIcon: Car, items: [
//         { href: '/driver/offer-ride', icon: Car, label: 'Offer a Ride' },
//         { href: '/driver/my-rides', icon: ListOrdered, label: 'My Offered Rides' },
//         { href: '/driver/ride-bookings', icon: ListOrdered, label: 'Ride Bookings' },
//     ]},
//     { value: "profile-account", triggerLabel: "Profile & Account", triggerIcon: UserCog, items: [
//         { href: '/driver/profile-settings/complete-account', icon: UserCog, label: 'Complete Account' },
//         { href: '/driver/profile-settings/edit-profile', icon: UserCog, label: 'Edit Profile' },
//         { href: '/driver/profile-settings/upload-documents', icon: FileUp, label: 'Upload Documents' },
//     ]},
//     { value: "general", triggerLabel: "General", triggerIcon: Inbox, items: [
//         { href: '/driver/earnings', icon: DollarSign, label: 'Earnings' },
//         { href: '/driver/inbox', icon: Inbox, label: 'Inbox' },
//         { href: '/driver/ride-history', icon: History, label: 'Ride History' },
//     ]},
//     { value: "help-settings", triggerLabel: "Help & Settings", triggerIcon: Settings, items: [
//         { href: '/driver/profile-settings/settings', icon: Settings, label: 'Settings' },
//         { href: '/driver/profile-settings/support', icon: LifeBuoy, label: 'Support' },
//     ]}
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   ], []); // Empty dependency array as these groups are static based on your structure


//   // --- TEMPORARILY COMMENTED OUT FOR DEBUGGING MANUAL CLICKS ---
//   // useEffect(() => {
//   //   const activeGroup = navGroups.find(group =>
//   //     group.items.some(item => pathname === item.href || (item.href !== '/driver' && pathname.startsWith(item.href)))
//   //   );
//   //   console.log("Accordion (useEffect): Pathname changed to:", pathname);
//   //   console.log("Accordion (useEffect): Active group based on path:", activeGroup?.value);
//   //   if (activeGroup) {
//   //     setOpenAccordionItems(prevOpenItems => {
//   //       if (!prevOpenItems.includes(activeGroup.value)) {
//   //         console.log("Accordion (useEffect): Setting open item to (adding):", [...prevOpenItems, activeGroup.value].filter((v, i, a) => a.indexOf(v) === i));
//   //         return [...prevOpenItems, activeGroup.value].filter((v, i, a) => a.indexOf(v) === i);
//   //       }
//   //       console.log("Accordion (useEffect): Active group already open or no change needed. Current:", prevOpenItems);
//   //       return prevOpenItems;
//   //     });
//   //   } else {
//   //      // If you want to close all non-active groups when navigating to a top-level page
//   //      // setOpenAccordionItems([]);
//   //      // console.log("Accordion (useEffect): No active group, current open items:", openAccordionItems);
//   //   }
//   // }, [pathname, navGroups]);
//   // --- END OF TEMPORARILY COMMENTED OUT SECTION ---


//   if (authIsLoading && !initialUser) {
//     return (
//       <aside className="flex flex-col w-72 bg-card border-r border-border h-full text-card-foreground shrink-0 p-4">
//         <p>Loading user information...</p>
//       </aside>
//     );
//   }

//   if (!effectiveUser) {
//     console.warn("DriverNavigationSidebar: effectiveUser is null. Parent layout should handle redirection.");
//     return (
//       <aside className="flex flex-col w-72 bg-card border-r border-border h-full text-card-foreground shrink-0 p-4">
//         <p>User not available.</p>
//         <Button onClick={() => router.push('/login')} className="mt-4">Login</Button>
//       </aside>
//     );
//   }

//   if (!effectiveUser.roles?.includes('DRIVER')) {
//     console.warn("DriverNavigationSidebar: User lacks DRIVER role.");
//     return (
//       <aside className="flex flex-col w-72 bg-card border-r border-border h-full text-card-foreground shrink-0 p-4">
//         <p>Access Denied: Not a Driver.</p>
//         <Button onClick={() => router.push('/')} className="mt-4">Go to Home</Button>
//       </aside>
//     );
//   }

//   // At this point, effectiveUser is a valid User object with roles.
//   const validUser = effectiveUser; // Re-assign for clarity and potential TS narrowing.

//   return (
//     <aside className="flex flex-col w-72 bg-card border-r border-border h-full text-card-foreground shrink-0">
//       <div className="p-4 flex flex-col items-center space-y-3 border-b border-border">
//         <div className="relative group">
//           <Avatar className="h-24 w-24 cursor-pointer">
//             <AvatarImage src={validUser.profilePictureUrl || undefined} alt={validUser.firstName || 'Driver'} />
//             <AvatarFallback className="text-3xl">
//               {validUser.firstName?.[0]?.toUpperCase()}
//               {validUser.lastName?.[0]?.toUpperCase()}
//             </AvatarFallback>
//           </Avatar>
//           <Link
//             href="/driver/profile-settings/edit-profile#profile-picture"
//             className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
//             aria-label="Change profile picture"
//           >
//             <Camera className="h-8 w-8 text-white" />
//           </Link>
//         </div>
//         <div className="text-center">
//           <h2 className="text-lg font-semibold">{validUser.firstName} {validUser.lastName}</h2>
//           <p className="text-xs text-muted-foreground">{validUser.email}</p>
//           {validUser.driverStatus && (
//             <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full
//               ${validUser.driverStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
//                 validUser.driverStatus === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-700' :
//                 'bg-red-100 text-red-700'}`}>
//               {validUser.driverStatus.replace('_', ' ')}
//             </span>
//           )}
//         </div>
//       </div>

//       <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
//         <AccordionPrimitive.Root
//           type="multiple" // Allows multiple sections to be open
//           value={openAccordionItems}
//           onValueChange={(newOpenItems) => {
//             // --- VERY IMPORTANT DEBUG LOG ---
//             console.log("ACCORDION CLICKED! onValueChange triggered. New open items:", newOpenItems);
//             // --- END DEBUG LOG ---
//             setOpenAccordionItems(newOpenItems);
//           }}
//           className="w-full"
//         >
//           {navGroups.map((group) => (
//             <AccordionNavGroup
//               key={group.value}
//               value={group.value}
//               triggerLabel={group.triggerLabel}
//               triggerIcon={group.triggerIcon}
//               items={group.items}
//               currentPath={pathname}
//             />
//           ))}
//         </AccordionPrimitive.Root>
//       </nav>

//       <div className="p-4 border-t border-border mt-auto">
//          <Button
//           variant="ghost"
//           className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
//           onClick={handleActualLogout}
//         >
//           <LogOut className="mr-3 h-5 w-5" />
//           Logout
//         </Button>
//       </div>
//     </aside>
//   );
// };

// export default DriverNavigationSidebar;

// frontend/components/navigation/DriverNavigationSidebar.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils"; // Assuming you have this utility

import {
  Car,
  ListOrdered,
  DollarSign,
  UserCog,
  FileUp,
  Settings,
  LifeBuoy,
  Inbox,
  History,
  LogOut,
  ChevronRight,
  ChevronDown,
  Camera
} from 'lucide-react';

import { useAuth } from '@/lib/AuthContext';

interface NavItemProps {
  href: string;
  icon?: React.ElementType;
  label: string;
  currentPath: string;
  isSubItem?: boolean;
}

const NavItem = ({ href, icon: Icon, label, currentPath, isSubItem }: NavItemProps) => {
  const isActive = currentPath === href || (href !== '/driver' && currentPath.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        `flex items-center py-2.5 text-sm font-medium rounded-md transition-colors duration-150 w-full`,
        isSubItem ? 'px-6 hover:bg-accent/50 dark:hover:bg-accent/20' : 'px-3 hover:bg-accent dark:hover:bg-accent/30',
        isActive
          ? (isSubItem ? 'text-primary dark:text-primary-dark font-semibold' : 'bg-primary dark:bg-primary-dark text-primary-foreground dark:text-primary-foreground-dark shadow-sm')
          : 'text-muted-foreground dark:text-gray-400'
      )}
    >
      {Icon && <Icon className={cn("h-5 w-5", isSubItem ? "mr-2" : "mr-3")} />}
      <span>{label}</span>
      {isActive && !isSubItem && <ChevronRight className="ml-auto h-4 w-4 text-primary-foreground/70 dark:text-primary-foreground-dark/70" />}
    </Link>
  );
};

interface AccordionNavGroupProps {
  triggerLabel: string;
  triggerIcon: React.ElementType;
  items: Array<Omit<NavItemProps, 'currentPath' | 'isSubItem'>>;
  currentPath: string;
  value: string; // Unique value for this accordion item
}

const AccordionNavGroup = ({ triggerLabel, triggerIcon: TriggerIcon, items, currentPath, value }: AccordionNavGroupProps) => {
  const isAnySubItemActive = items.some(item => currentPath === item.href || (item.href !== '/driver' && currentPath.startsWith(item.href)));

  return (
    <AccordionPrimitive.Item value={value} className="border-b border-border/50 dark:border-gray-700 last:border-b-0">
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger
          className={cn(
            "flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-md transition-all hover:bg-accent dark:hover:bg-accent/30 group",
            isAnySubItemActive ? "text-primary dark:text-primary-dark font-semibold" : "text-foreground dark:text-gray-200"
          )}
        >
          <div className="flex items-center">
            <TriggerIcon className="mr-3 h-5 w-5" />
            <span>{triggerLabel}</span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground dark:text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content
        className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      >
        <div className="pt-1 pb-2 space-y-0.5">
          {items.map((item) => (
            <NavItem key={item.href} {...item} currentPath={currentPath} isSubItem />
          ))}
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
};


interface DriverNavigationSidebarProps {
  initialUser: User;
}

const DriverNavigationSidebar = ({ initialUser }: DriverNavigationSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user: contextUser, logoutUser, isLoading: authIsLoading } = useAuth();
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);

  const effectiveUser = contextUser !== undefined ? contextUser : initialUser;

  const handleActualLogout = async () => {
    if (logoutUser) { await logoutUser(); }
    router.push('/login');
  };

  const navGroups = useMemo(() => [
    { value: "ride-management", triggerLabel: "Ride Management", triggerIcon: Car, items: [
        { href: '/driver/offer-ride', icon: Car, label: 'Offer a Ride' },
        { href: '/driver/my-rides', icon: ListOrdered, label: 'My Offered Rides' },
        { href: '/driver/ride-bookings', icon: ListOrdered, label: 'Ride Bookings' },
    ]},
    { value: "profile-account", triggerLabel: "Profile & Account", triggerIcon: UserCog, items: [
        { href: '/driver/profile-settings/complete-account', icon: UserCog, label: 'Complete Account' },
        { href: '/driver/profile-settings/edit-profile', icon: UserCog, label: 'Edit Profile' },
        { href: '/driver/profile-settings/upload-documents', icon: FileUp, label: 'Upload Documents' },
    ]},
    { value: "general", triggerLabel: "General", triggerIcon: Inbox, items: [
        { href: '/driver/earnings', icon: DollarSign, label: 'Earnings' },
        { href: '/driver/inbox', icon: Inbox, label: 'Inbox' },
        { href: '/driver/ride-history', icon: History, label: 'Ride History' },
    ]},
    { value: "help-settings", triggerLabel: "Help & Settings", triggerIcon: Settings, items: [
        { href: '/driver/profile-settings/settings', icon: Settings, label: 'Settings' },
        { href: '/driver/profile-settings/support', icon: LifeBuoy, label: 'Support' },
    ]}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);


  // useEffect for automatically opening the active accordion section
  // Uncomment this after verifying manual clicks work.
  /*
  useEffect(() => {
    const activeGroup = navGroups.find(group =>
      group.items.some(item => pathname === item.href || (item.href !== '/driver' && pathname.startsWith(item.href)))
    );
    // console.log("Accordion (useEffect): Pathname changed to:", pathname);
    // console.log("Accordion (useEffect): Active group based on path:", activeGroup?.value);
    if (activeGroup) {
      setOpenAccordionItems(prevOpenItems => {
        if (!prevOpenItems.includes(activeGroup.value)) {
          // For type="multiple", add the new active group without closing others that might have been manually opened.
          // console.log("Accordion (useEffect): Adding to open items:", [...prevOpenItems, activeGroup.value].filter((v, i, a) => a.indexOf(v) === i));
          return [...prevOpenItems, activeGroup.value].filter((v, i, a) => a.indexOf(v) === i); // Ensure unique values
        }
        return prevOpenItems; // No change if active group is already in open items
      });
    } else {
      // Optional: If you want to close all accordions when navigating to a page
      // that doesn't have an item in any group, uncomment the line below.
      // Otherwise, manually opened accordions will stay open.
      // setOpenAccordionItems([]);
      // console.log("Accordion (useEffect): No active group for current path.");
    }
  }, [pathname, navGroups]);
  */


  if (authIsLoading && !initialUser) {
    return (
      <aside className="flex flex-col w-72 bg-card dark:bg-gray-800 border-r border-border dark:border-gray-700 h-full text-card-foreground dark:text-gray-200 shrink-0 p-4">
        <p>Loading user information...</p>
      </aside>
    );
  }

  if (!effectiveUser) {
    console.warn("DriverNavigationSidebar: effectiveUser is null. Parent layout should handle redirection.");
    return (
      <aside className="flex flex-col w-72 bg-card dark:bg-gray-800 border-r border-border dark:border-gray-700 h-full text-card-foreground dark:text-gray-200 shrink-0 p-4">
        <p>User not available.</p>
        <Button onClick={() => router.push('/login')} className="mt-4">Login</Button>
      </aside>
    );
  }

  if (!effectiveUser.roles?.includes('DRIVER')) {
    console.warn("DriverNavigationSidebar: User lacks DRIVER role.");
    return (
      <aside className="flex flex-col w-72 bg-card dark:bg-gray-800 border-r border-border dark:border-gray-700 h-full text-card-foreground dark:text-gray-200 shrink-0 p-4">
        <p>Access Denied: Not a Driver.</p>
        <Button onClick={() => router.push('/')} className="mt-4">Go to Home</Button>
      </aside>
    );
  }

  const validUser = effectiveUser; // For type safety and clarity below

  return (
    <aside className="flex flex-col w-72 bg-card dark:bg-gray-800 border-r border-border dark:border-gray-700 h-full text-card-foreground dark:text-gray-200 shrink-0">
      <div className="p-4 flex flex-col items-center space-y-3 border-b border-border dark:border-gray-700">
        <div className="relative group cursor-pointer" onClick={() => router.push('/driver/profile-settings/edit-profile')}>
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={validUser.profilePictureUrl || undefined}
              alt={validUser.firstName ? `${validUser.firstName}'s profile picture` : 'Driver profile picture'}
            />
            <AvatarFallback className="text-3xl bg-muted dark:bg-gray-600">
              {(validUser.firstName?.[0] || '').toUpperCase()}
              {(validUser.lastName?.[0] || '').toUpperCase()}
              {!(validUser.firstName || validUser.lastName) && validUser.username?.[0]?.toUpperCase()}
              {!(validUser.firstName || validUser.lastName || validUser.username) && 'D'}
            </AvatarFallback>
          </Avatar>
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Change profile picture"
          >
            <Camera className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold">
            {validUser.firstName || ''} {validUser.lastName || ''}
            {!(validUser.firstName || validUser.lastName) && (validUser.username || 'Driver')}
          </h2>
          <p className="text-xs text-muted-foreground dark:text-gray-400">{validUser.email}</p>
          {validUser.driverStatus && (
            <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full
              ${validUser.driverStatus === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' :
                validUser.driverStatus === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100' :
                'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100'}`}>
              {validUser.driverStatus.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
        <AccordionPrimitive.Root
          type="multiple"
          value={openAccordionItems}
          onValueChange={(newOpenItems) => {
            console.log("ACCORDION CLICKED! onValueChange triggered. New open items:", newOpenItems);
            setOpenAccordionItems(newOpenItems);
          }}
          className="w-full"
        >
          {navGroups.map((group) => (
            <AccordionNavGroup
              key={group.value}
              value={group.value}
              triggerLabel={group.triggerLabel}
              triggerIcon={group.triggerIcon}
              items={group.items}
              currentPath={pathname}
            />
          ))}
        </AccordionPrimitive.Root>
      </nav>

      <div className="p-4 border-t border-border dark:border-gray-700 mt-auto">
         <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground dark:text-gray-300 hover:bg-destructive/10 dark:hover:bg-red-700/20 hover:text-destructive dark:hover:text-red-400"
          onClick={handleActualLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default DriverNavigationSidebar;