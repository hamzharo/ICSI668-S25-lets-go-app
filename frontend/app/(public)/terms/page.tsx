// frontend/app/terms/page.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FileText as FileTextIcon } from 'lucide-react'; // Renamed to avoid conflict if needed

// If NOT using a shared PublicLayout, include Header/Footer here:
const PublicHeader = () => ( /* ... copy from PublicLayout example ... */ );
const PublicFooter = () => ( /* ... copy from PublicLayout example ... */ );

export const metadata = {
  title: "Terms of Service | Let's GO",
  description: "Review the Terms of Service for using the Let's GO carpooling application.",
};

const TermsPage = () => {
  const lastUpdated = "October 26, 2023"; // Placeholder: Update this date

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* <PublicHeader /> */}
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
            <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">Sign Up</Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 md:py-16 lg:py-20">
        <article className="prose prose-slate dark:prose-invert lg:prose-lg max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <FileTextIcon className="h-16 w-16 text-primary dark:text-blue-400 mx-auto mb-4" />
            <h1 className="!mb-2">Terms of Service for Let's GO</h1>
            <p className="text-sm text-muted-foreground dark:text-gray-400">Last Updated: {lastUpdated}</p>
          </div>

          <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Let's GO mobile application and website (the "Service") operated by Let's GO ("us", "we", or "our").</p>
          <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>
          <p><strong>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</strong></p>

          <h2>1. Accounts</h2>
          <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
          <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>

          <h2>2. Ride Offering and Booking</h2>
          <p>Let's GO provides a platform for Drivers to offer rides and for Passengers to book these rides. We are not a transportation carrier and do not provide transportation services ourselves.</p>
          <ul>
            <li><strong>For Drivers:</strong> You agree to provide accurate information about your ride, vehicle, and yourself. You must possess a valid driver's license, appropriate insurance, and ensure your vehicle is in safe, roadworthy condition. You are responsible for complying with all local laws and regulations regarding driving and passenger transport.</li>
            <li><strong>For Passengers:</strong> You agree to treat drivers and their vehicles with respect. Payment for rides is handled through the platform as per the agreed price.</li>
          </ul>
          
          {/* Add sections for:
            - User Conduct
            - Payments and Fees (if applicable, how they are handled)
            - Content (user-generated content policies)
            - Intellectual Property
            - Termination
            - Limitation of Liability
            - Governing Law
            - Changes to Terms
            - Contact Us
          */}

          <h2>Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at legal@letsgoapp.com (Placeholder Email).</p>
          
          <p className="mt-8 text-sm"><em>(Note: This is a template and should be reviewed and customized by a legal professional to ensure it meets all applicable legal requirements for your specific service and jurisdiction.)</em></p>
        </article>
      </main>

      {/* <PublicFooter /> */}
       <footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Let's GO CarSharing. All Rights Reserved.</p>
            <div className="mt-2 space-x-4"> <Link href="/privacy" className="hover:underline">Privacy Policy</Link> <span>|</span> <Link href="/terms" className="hover:underline">Terms of Service</Link> </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;