// frontend/app/privacy/page.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

// If NOT using a shared PublicLayout, include Header/Footer here:
const PublicHeader = () => ( /* ... copy from PublicLayout example ... */ );
const PublicFooter = () => ( /* ... copy from PublicLayout example ... */ );


export const metadata = {
  title: "Privacy Policy | Let's GO",
  description: "Read the Let's GO Privacy Policy to understand how we collect, use, and protect your personal information.",
};

const PrivacyPage = () => {
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
            <ShieldCheck className="h-16 w-16 text-primary dark:text-blue-400 mx-auto mb-4" />
            <h1 className="!mb-2">Privacy Policy for Let's GO</h1>
            <p className="text-sm text-muted-foreground dark:text-gray-400">Last Updated: {lastUpdated}</p>
          </div>

          <p>Welcome to Let's GO ("us", "we", or "our"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at privacy@letsgoapp.com (Placeholder Email).</p>

          <h2>1. Information We Collect</h2>
          <p>We collect personal information that you voluntarily provide to us when you register on the application, express an interest in obtaining information about us or our products and services, when you participate in activities on the application (such as offering or booking rides, posting messages) or otherwise when you contact us.</p>
          <p>The personal information that we collect depends on the context of your interactions with us and the application, the choices you make and the products and features you use. The personal information we collect may include the following:</p>
          <ul>
            <li><strong>Personal Information Provided by You:</strong> Names; phone numbers; email addresses; mailing addresses; usernames; passwords; contact preferences; contact or authentication data; billing addresses; debit/credit card numbers (processed by our payment partners); driver license information; vehicle details; profile pictures; and other similar information.</li>
            <li><strong>Location Data:</strong> We may collect information about the location of your device if you grant us permission, such as for ride tracking or searching nearby rides.</li>
            <li><strong>Usage Data:</strong> Information automatically collected when you access and use the application, such as IP address, browser type, operating system, referring URLs, pages viewed, and dates/times of access.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use personal information collected via our application for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
          <ul>
            <li>To facilitate account creation and logon process.</li>
            <li>To enable user-to-user communications (e.g., chat between driver and passenger).</li>
            <li>To manage user accounts and provide customer support.</li>
            <li>To send administrative information to you for business purposes, legal reasons and/or possibly contractual.</li>
            <li>To process your ride offers, bookings, and payments.</li>
            <li>To verify driver identity and documents for safety and compliance.</li>
            {/* ... Add more relevant sections ... */}
          </ul>

          <h2>3. Sharing Your Information</h2>
          <p>We may share your information with third parties in the following situations:</p>
          <ul>
            <li><strong>With Other Users:</strong> When you offer or book a ride, certain information (like your name, profile picture, vehicle details (for drivers), approximate pickup/dropoff points) may be shared with the other party involved in the ride.</li>
            <li><strong>Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors or agents who perform services for us or on our behalf and require access to such information to do that work (e.g., payment processing, data analytics, email delivery, hosting services, customer service and marketing efforts).</li>
            <li><strong>Legal Requirements:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.</li>
            {/* ... Add more relevant sections ... */}
          </ul>
          
          {/* Add sections for:
            - Data Security
            - Data Retention
            - Your Privacy Rights (e.g., GDPR, CCPA if applicable)
            - Policy for Minors
            - Updates to This Notice
            - Contact Us
          */}
          <h2>Contact Us</h2>
          <p>If you have questions or comments about this notice, you may email us at privacy@letsgoapp.com (Placeholder Email) or by post to:</p>
          <p>Let's GO CarSharing<br/>[Your Company Address Line 1 - Placeholder]<br/>[Your Company Address Line 2 - Placeholder]<br/>[City, State, Zip - Placeholder]</p>

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

export default PrivacyPage;