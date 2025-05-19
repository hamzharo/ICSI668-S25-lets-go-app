// frontend/app/(public)/privacy/page.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

// REMOVED Unused and problematic PublicHeader and PublicFooter definitions

export const metadata = {
  title: "Privacy Policy | Let's GO ",
  description: "Read the Let's GO Privacy Policy to understand how we collect, use, and protect your personal information. (Content)",
};

const PrivacyPage = () => {
  const lastUpdated = "October 26, 2023"; // Placeholder/Demo: Update this date if needed

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">

      <main className="flex-grow container mx-auto px-4 py-12 md:py-16 lg:py-20">
        <article className="prose prose-slate dark:prose-invert lg:prose-lg max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <ShieldCheck className="h-16 w-16 text-primary dark:text-blue-400 mx-auto mb-4" />
            <h1 className="!mb-2">Privacy Policy for Let's GO </h1>
            <p className="text-sm text-muted-foreground dark:text-gray-400">Last Updated: {lastUpdated} (Date)</p>
          </div>

          <p>Welcome to Let's GO ("us", "we", or "our"). This is a privacy policy. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at privacy@letsgoapp.letsgo.com (Placeholder Email).</p>

          <h2>1. Information We Collect </h2>
          <p>This section describes information collection. We collect personal information that you voluntarily provide to us when you register on the application, express an interest in obtaining information about us or our products and services, when you participate in activities on the application (such as offering or booking rides, posting messages) or otherwise when you contact us.</p>
          <p>The personal information that we collect depends on the context of your interactions with us and the application, the choices you make and the products and features you use. The personal information we collect may include the following (examples):</p>
          <ul>
            <li><strong>Personal Information Provided by You:</strong> Names; phone numbers; email addresses; mailing addresses; usernames; passwords; contact preferences; contact or authentication data; billing addresses; debit/credit card numbers (processed by our payment partners); driver license information; vehicle details; profile pictures; and other similar information.</li>
            <li><strong>Location Data:</strong> We may collect information about the location of your device if you grant us permission, such as for ride tracking or searching nearby rides (
              feature).</li>
            <li><strong>Usage Data:</strong> Information automatically collected when you access and use the application, such as IP address, browser type, operating system, referring URLs, pages viewed, and dates/times of access (data).</li>
          </ul>

          <h2>2. How We Use Your Information </h2>
          <p>We use personal information collected via our application for a variety of business purposes described below (for purposes). We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
          <ul>
            <li>To facilitate account creation and logon process .</li>
            <li>To enable user-to-user communications (e.g., chat between driver and passenger) .</li>
            <li>To manage user accounts and provide customer support .</li>
            <li>To send administrative information to you for business purposes, legal reasons and/or possibly contractual .</li>
            <li>To process your ride offers, bookings, and payments .</li>
            <li>To verify driver identity and documents for safety and compliance .</li>
            {/* ... Add more relevant demo sections ... */}
          </ul>

          <h2>3. Sharing Your Information </h2>
          <p>We may share your information with third parties in the following situations (examples):</p>
          <ul>
            <li><strong>With Other Users:</strong> When you offer or book a ride, certain information (like your name, profile picture, vehicle details (for drivers), approximate pickup/dropoff points) may be shared with the other party involved in the ride (sharing).</li>
            <li><strong>Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors or agents who perform services for us or on our behalf and require access to such information to do that work (e.g., payment processing, data analytics, email delivery, hosting services, customer service and marketing efforts) (providers).</li>
            <li><strong>Legal Requirements:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process (compliance).</li>
            {/* ... Add more relevant demo sections ... */}
          </ul>
          
          <h2>Data Security </h2>
          <p>This section would describe data security measures in a real application.</p>
          <h2>Data Retention </h2>
          <p>This section would describe data retention policies in a real application.</p>
          <h2>Your Privacy Rights </h2>
          <p>This section would describe user privacy rights (e.g., GDPR, CCPA if applicable) in a real application.</p>
          <h2>Policy for Minors </h2>
          <p>This section would describe policies regarding minors in a real application.</p>
          <h2>Updates to This Notice </h2>
          <p>This section would describe how updates to the policy are handled in a real application.</p>

          <h2>Contact Us </h2>
          <p>If you have questions or comments about this  notice, you may email us at privacy@letsgoapp.letsgo.com (Placeholder Email) or by post to:</p>
          <p>Let's GO CarSharing <br/>[123 Address Line 1 - Placeholder]<br/>[ Address Line 2 - Placeholder]<br/> City, State, Zip - Placeholder]</p>

          <p className="mt-8 text-sm"><em>(Note: This is a template and should be reviewed and customized by a legal professional for a real application.)</em></p>
        </article>
      </main>

    </div>
  );
};

export default PrivacyPage;
