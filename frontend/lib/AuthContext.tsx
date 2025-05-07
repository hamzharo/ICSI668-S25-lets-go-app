// frontend/lib/AuthContext.tsx
'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // Install: npm install jwt-decode
import { User, DecodedJwt } from '@/types'; // Assuming types are in @/types

interface AuthContextType {
  user: User | null;
  token: string | null; // Added token to the context
  isLoading: boolean;
  loginUser: (newToken: string) => void; // Renamed to avoid conflict with AuthForm's login
  logoutUser: () => void; // Renamed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'your_auth_token_cookie_name'; // Ensure this matches AuthForm

// Helper to get cookie (client-side only)
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null; // Guard for server-side rendering if context is ever imported there
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()!.split(';').shift()!);
  return null;
};

// Helper to remove cookie (client-side only)
const removeCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`; // Add ; Secure in production
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getCookie(AUTH_COOKIE_NAME);
    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedJwt>(storedToken);
        // Ideally, also verify token expiration (decoded.exp * 1000 > Date.now())
        if (decoded.exp * 1000 > Date.now()) {
            setToken(storedToken);
            setUser({
                id: decoded.sub,
                emailId: decoded.email, // Assuming emailId is what you use in User type
                firstName: decoded.firstName || 'N/A',
                lastName: decoded.lastName || 'N/A',
                role: decoded.role,
                driverStatus: decoded.driverStatus || null,
            });
        } else {
            // Token expired
            logoutUser(); // Clear user and token
        }
      } catch (error) {
        console.error("Invalid token:", error);
        removeCookie(AUTH_COOKIE_NAME); // Clear invalid token
      }
    }
    setIsLoading(false);
  }, []);

  const loginUser = (newToken: string) => {
    // Assuming cookie is set by AuthForm or another mechanism before calling this
    // This function primarily updates the React state from the new token
    try {
      const decoded = jwtDecode<DecodedJwt>(newToken);
      setToken(newToken);
      setUser({
        id: decoded.sub,
        emailId: decoded.email,
        firstName: decoded.firstName || 'N/A',
        lastName: decoded.lastName || 'N/A',
        role: decoded.role,
        driverStatus: decoded.driverStatus || null,
      });
      // The cookie should ideally be set by the component initiating login (e.g., AuthForm)
      // document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(newToken)}; expires=...; path=/; SameSite=Lax; Secure`;
    } catch (error) {
      console.error("Error decoding new token:", error);
    }
  };

  const logoutUser = () => {
    removeCookie(AUTH_COOKIE_NAME);
    setUser(null);
    setToken(null);
    // router.replace('/login'); // Handle redirection in middleware or layouts
  };

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