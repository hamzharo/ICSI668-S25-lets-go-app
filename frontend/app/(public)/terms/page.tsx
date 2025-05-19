// frontend/app/(public)/terms/page.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FileText as FileTextIcon } from 'lucide-react';

// REMOVED Unused and problematic PublicHeader and PublicFooter definitions

export const metadata = {
  title: "Terms of Service | Let's GO (Demo)",
  description: "Review the Terms of Service for using the Let's GO carpooling application. (Demo Content)",
};

const TermsPage = () => {
  const lastUpdated = "October 26, 2023"; // Placeholder/Demo: Update this date if needed

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
     

      <main className="flex-grow container mx-auto px-4 py-12 md:py-16 lg:py-20">
        <article className="prose prose-slate dark:prose-invert lg:prose-lg max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <FileTextIcon className="h-16 w-16 text-primary dark:text-blue-400 mx-auto mb-4" />
            <h1 className="!mb-2">Terms of Service for Let's GO (Demo)</h1>
            <p className="text-sm text-muted-foreground dark:text-gray-400">Last Updated: {lastUpdated} (Demo Date)</p>
          </div>

          <p>Please read these Demo Terms of Service ("Terms", "Terms of Service") carefully before using the Let's GO mobile application and website (the "Service") operated by Let's GO ("us", "we", or "our").</p>
          <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>
          <p><strong>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service. (This is for demo purposes only).</strong></p>

          <h2>1. Accounts (Demo)</h2>
          <p>When you create an account with us (for this demo), you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
          <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service (demo responsibility).</p>

          <h2>2. Ride Offering and Booking (Demo)</h2>
          <p>Let's GO provides a demo platform for Drivers to offer rides and for Passengers to book these rides. We are not a transportation carrier and do not provide transportation services ourselves.</p>
          <ul>
            <li><strong>For Drivers (Demo):</strong> You agree to provide accurate information about your ride, vehicle, and yourself. You must possess a valid driver's license, appropriate insurance, and ensure your vehicle is in safe, roadworthy condition. You are responsible for complying with all local laws and regulations regarding driving and passenger transport (demo compliance).</li>
            <li><strong>For Passengers (Demo):</strong> You agree to treat drivers and their vehicles with respect. Payment for rides is handled through the platform as per the agreed price (demo payment).</li>
          </ul>
          
          <h2>User Conduct (Demo)</h2>
          <p>This section would detail user conduct policies in a real application.</p>
          <h2>Payments and Fees (Demo)</h2>
          <p>This section would detail payments and fees in a real application.</p>
          <h2>Content (Demo)</h2>
          <p>This section would detail user-generated content policies in a real application.</p>
          <h2>Intellectual Property (Demo)</h2>
          <p>This section would detail intellectual property rights in a real application.</p>
          <h2>Termination (Demo)</h2>
          <p>This section would detail account termination policies in a real application.</p>
          <h2>Limitation of Liability (Demo)</h2>
          <p>This section would detail limitations of liability in a real application.</p>
          <h2>Governing Law (Demo)</h2>
          <p>This section would detail the governing law in a real application.</p>
          <h2>Changes to Terms (Demo)</h2>
          <p>This section would detail how changes to terms are handled in a real application.</p>

          <h2>Contact Us (Demo)</h2>
          <p>If you have any questions about these Demo Terms, please contact us at legal@letsgoapp.demo.com (Placeholder Email).</p>
          
          <p className="mt-8 text-sm"><em>(Note: This is a template and should be reviewed and customized by a legal professional for a real application.)</em></p>
        </article>
      </main>

    </div>
  );
};

export default TermsPage;