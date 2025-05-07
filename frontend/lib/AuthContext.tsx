// frontend/lib/AuthContext.tsx
'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User, DecodedJwt } from '@/types'; // Assuming types are in @/types

// --- Configuration (Ensure these match your setup) ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const USER_ME_ENDPOINT = '/api/users/me';
const AUTH_COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'your_auth_token_cookie_name'; // ACTION: Verify this matches AuthForm.tsx and .env.local
// --- End Configuration ---

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  loginUser: (newToken: string) => Promise<void>; // Updated to be async
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get cookie (client-side only)
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()!.split(';').shift()!);
  return null;
};

// Helper to remove cookie (client-side only)
// ACTION: Ensure the cookie removal logic uses the correct AUTH_COOKIE_NAME and flags
const removeCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  // Add Secure flag in production
  if (process.env.NODE_ENV === 'production') {
    cookieString += '; Secure';
  }
  document.cookie = cookieString;
  console.log(`Cookie '${name}' removed with flags: path=/, SameSite=Lax${process.env.NODE_ENV === 'production' ? ', Secure' : ''}`);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // True until initial auth check is done

  // Wrapped logout logic for reuse and to ensure state consistency
  const performLogout = useCallback(() => {
    removeCookie(AUTH_COOKIE_NAME);
    setUser(null);
    setToken(null);
    // setIsLoading(false); // isLoading is primarily for the initial load phase
    console.log("User logged out, session cleared.");
  }, []);


  // Fetches full user details from the backend
  const fetchUserDetails = useCallback(async (tokenToFetchWith: string) => {
    // No need to setIsLoading(true) here if this is part of a larger loading flow handled by useEffect
    try {
      const response = await fetch(`${API_BASE_URL}${USER_ME_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${tokenToFetchWith}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData: User = await response.json();
        // ACTION: Modify User Object Creation - This is now handled by fetching /api/users/me.
        // The userData from backend should match your User type.
        setUser(userData);
        setToken(tokenToFetchWith); // Confirm the token by successful /me fetch
        console.log("User details fetched successfully:", userData);
      } else {
        // Handle non-ok responses (e.g., 401, 403, user not found)
        console.error("Failed to fetch user details:", response.status, await response.text());
        performLogout(); // Token might be valid but user deleted, or other server issue
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      performLogout(); // Network error or other issue
    }
    // setIsLoading(false); // Let the caller (useEffect or loginUser) manage overall isLoading
  }, [performLogout]); // Added performLogout to dependencies

  // ACTION: Inside the useEffect hook that runs on initial load
  useEffect(() => {
    const attemptAutoLogin = async () => {
      setIsLoading(true); // Start loading indication
      const storedToken = getCookie(AUTH_COOKIE_NAME);

      if (storedToken) {
        try {
          // ACTION: Modify User Object Creation - Decoding token mainly for expiration check now.
          // User object will be populated by fetchUserDetails.
          const decoded = jwtDecode<DecodedJwt>(storedToken);

          // Verify token expiration
          if (decoded.exp * 1000 > Date.now()) {
            // Token exists and is not expired, now fetch full user details
            await fetchUserDetails(storedToken);
          } else {
            // Token expired
            console.log("Stored token expired, logging out.");
            performLogout();
          }
        } catch (error) {
          console.error("Invalid stored token:", error);
          performLogout(); // Clear invalid token and user state
        }
      }
      // If no token, or after processing token, finish loading
      setIsLoading(false);
    };

    attemptAutoLogin();
  }, [fetchUserDetails, performLogout]); // useEffect depends on these functions

  // ACTION: Inside the loginUser function
  const loginUser = useCallback(async (newToken: string) => {
    // Assuming cookie is set by AuthForm.tsx before this function is called.
    // This function will now fetch user details using the new token.
    setIsLoading(true); // Indicate loading during login process
    // No need to decode here just for setting user; fetchUserDetails will get fresh data.
    // However, you might want to decode if you need immediate access to some JWT claims
    // before the /me call completes, but typically not necessary.
    await fetchUserDetails(newToken);
    setIsLoading(false); // Done with login process
  }, [fetchUserDetails]);

  // ACTION: Inside the logoutUser function
  const logoutUser = useCallback(() => {
    performLogout();
    // Optionally, redirect here or let consuming components/middleware handle it.
    // e.g., router.push('/login');
  }, [performLogout]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};