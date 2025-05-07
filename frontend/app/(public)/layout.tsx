// frontend/app/(public)/layout.tsx (Conceptual - create this if you group static pages)
import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // For "Let's GO" logo

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      {/* Public Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/80 backdrop-blur-sm">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/icons/logo.png" width={36} height={36} alt="Let's GO Logo" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">Let's GO</span>
          </Link>
          <div className="space-x-2 sm:space-x-4">
            <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-blue-400">About</Link>
            <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-blue-400">Contact</Link>
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-blue-400">Login</Link>
            <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Page Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Let's GO CarSharing. All Rights Reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <span>|</span>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}