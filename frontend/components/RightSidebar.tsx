// frontend/components/RightSidebar.tsx
'use client';

import Image from 'next/image'; // Using next/image
import React, { useState, useEffect } from 'react';
import { RightSidebarProps, User } from '@/types'; // User type should include profileImageUrl (optional string)
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'react-toastify';
import { Loader2, Camera, Edit3, CheckCircle, ShieldAlert, Settings, HelpCircle, LogOut } from 'lucide-react'; // Icons
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation'; // For logout redirect

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'; // For "Let's GO"

const RightSidebar = ({ user: initialUserFromLayout }: RightSidebarProps) => {
  const { token, user: authUserFromContext, loginUser, logoutUser } = useAuth(); // loginUser can re-set user in context
  const router = useRouter();

  // Prioritize user from context, fallback to prop (though context should be the source of truth)
  const [currentUser, setCurrentUser] = useState<User | null>(authUserFromContext || initialUserFromLayout);

  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUser(authUserFromContext); // Keep local state synced with context
    if (authUserFromContext?.profileImageUrl) {
      setProfileImagePreview(null); // Clear preview if a new server image URL is available
    }
  }, [authUserFromContext]);

  const handleImageChangeAndUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Invalid file type. Please select an image (JPEG, PNG, GIF, WebP).");
      e.target.value = ''; // Reset file input
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit example
      toast.error("File is too large. Maximum size is 2MB.");
      e.target.value = ''; // Reset file input
      return;
    }

    // Client-side preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // --- Actual Upload ---
    if (!token) {
      toast.error("Authentication error. Please log in again.");
      e.target.value = ''; // Reset file input
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append('file', file); // 'file' should match your backend's expected parameter name

    try {
      // TODO: Replace with your actual API endpoint for profile picture upload
      const response = await fetch(`${API_BASE_URL}/api/users/me/profile-picture`, {
        method: 'POST',
        headers: {
          // 'Content-Type' is set automatically by browser for FormData
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Profile picture upload failed.");
      }

      toast.success("Profile picture updated successfully!");

      // The backend should ideally return the updated user object or at least the new profileImageUrl.
      // Update AuthContext: The best way is if AuthContext has a function to update the user object,
      // or if loginUser can trigger a refetch of /api/users/me.
      if (loginUser && token) { // This re-decodes token or refetches /me depending on AuthContext impl.
          loginUser(token);
      }
      // If result directly contains the new URL and you want to update locally faster:
      // else if (result.profileImageUrl && currentUser) {
      //    setCurrentUser({ ...currentUser, profileImageUrl: result.profileImageUrl });
      // }
      setProfileImagePreview(null); // Clear preview

    } catch (error: any) {
      setUploadError(error.message || "An unexpected error occurred.");
      toast.error(error.message || "Failed to upload profile picture.");
      setProfileImagePreview(null); // Clear preview on error
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset file input in all cases after attempt
    }
  };

  const handleLogout = () => {
    logoutUser(); // From AuthContext
    toast.info("You have been logged out.");
    router.replace('/login');
  };

  const displayedImage = profileImagePreview || currentUser?.profileImageUrl || null;
  const userName = currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'User' : 'User';
  const userEmail = currentUser?.emailId || 'user@example.com';
  const userInitial = currentUser?.firstName ? currentUser.firstName[0].toUpperCase() : 'U';

  const menuItems = [
    { href: '/profile-settings/edit-profile', label: 'Edit Profile', icon: Edit3, roles: ['PASSENGER', 'DRIVER', 'ADMIN'] },
    { href: '/profile-settings/complete-account', label: 'Account Status', icon: CheckCircle, roles: ['PASSENGER', 'DRIVER', 'ADMIN'] },
    { href: '/profile-settings/upload-documents', label: 'My Documents', icon: ShieldAlert, roles: ['DRIVER'] }, // Only for DRIVER
    { href: '/profile-settings/settings-support', label: 'Settings', icon: Settings, roles: ['PASSENGER', 'DRIVER', 'ADMIN'] },
    // { href: '/help', label: 'Help Center', icon: HelpCircle, roles: ['PASSENGER', 'DRIVER', 'ADMIN'] },
  ];

  const accessibleMenuItems = menuItems.filter(item => currentUser && item.roles.includes(currentUser.role));

  return (
    <aside className='right-sidebar w-72 md:w-80 bg-white dark:bg-gray-800 p-4 shadow-xl h-screen sticky top-0 flex flex-col'>
      {/* Profile Section */}
      <section className='flex flex-col items-center pb-6 border-b dark:border-gray-700'>
        <div className={`profile-banner h-24 md:h-28 w-full rounded-t-lg relative mb-[-40px] md:mb-[-48px] ${!currentUser?.profileBannerUrl ? 'bg-gradient-to-r from-blue-600 to-indigo-700' : ''}`}>
          {currentUser?.profileBannerUrl && <Image src={currentUser.profileBannerUrl} layout="fill" objectFit="cover" alt="Profile Banner" className="rounded-t-lg"/>}
        </div>

        <label className='profile-img-container block w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white dark:border-gray-800 cursor-pointer relative group bg-gray-200 dark:bg-gray-700 shadow-md'>
          {displayedImage ? (
            <Image src={displayedImage} alt={userName} layout="fill" objectFit="cover" className='rounded-full' />
          ) : (
            <span className='w-full h-full flex items-center justify-center text-3xl md:text-4xl font-bold text-primary dark:text-blue-400'>
              {userInitial}
            </span>
          )}
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-opacity duration-300">
            {isUploading ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : (
              <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChangeAndUpload}
            className="absolute opacity-0 w-full h-full top-0 left-0 cursor-pointer"
            aria-label="Upload profile picture"
            disabled={isUploading || !currentUser} // Disable if no user context
          />
        </label>
        {uploadError && <p className="text-xs text-red-500 mt-1.5 text-center">{uploadError}</p>}

        <div className='profile-details mt-3 text-center w-full'>
          <h1 className='text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 truncate px-2' title={userName}>
            {userName}
          </h1>
          <p className='text-xs text-gray-500 dark:text-gray-400 truncate px-2' title={userEmail}>
            {userEmail}
          </p>
        </div>
      </section>

      {/* Navigation Menu */}
      <nav className='flex-grow mt-6 space-y-1.5 overflow-y-auto pr-1'>
        {accessibleMenuItems.map(item => (
          <Link key={item.label} href={item.href} className='flex items-center p-2.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/70 hover:text-primary dark:hover:text-blue-400 transition-colors group'>
            <item.icon className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Button at the bottom */}
      <div className="mt-auto pt-4 border-t dark:border-gray-700">
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-700/20 dark:hover:text-red-400">
            <LogOut className="mr-3 h-5 w-5"/>
            <span className="text-sm font-medium">Log Out</span>
        </Button>
      </div>
    </aside>
  );
};

export default RightSidebar;