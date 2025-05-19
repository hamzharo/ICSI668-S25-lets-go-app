// frontend/app/(public)/contact/page.tsx
// NO "use client"; directive here. This is a Server Component.

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Mail, MapPin as LocationPin, Phone } from 'lucide-react'; // Icons for this page
import ContactForm from './ContactForm';

// Metadata can now be correctly exported from this Server Component
export const metadata = {
  title: "Contact Us | Let's GO",
  description: "Get in touch with the Let's GO team. We're here to help with any questions or feedback you have about our carpooling service.",
};

const ContactPage = () => {
  // The form's handleSubmit logic is now inside ContactForm.tsx

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16 lg:py-20">
        {/* Page Title and Introduction */}
        <section className="text-center mb-12 md:mb-16">
          <Mail className="h-16 w-16 text-primary dark:text-blue-400 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Get In Touch
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground dark:text-gray-400 max-w-2xl mx-auto">
            Have questions, feedback, or need support? We're here to help! Reach out to us through any of the channels below or use the contact form. (Demo text)
          </p>
        </section>

        <Separator className="my-8 md:my-12" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Contact Information Section (Static Demo Data) */}
          <section className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">Contact Information</h2>
              <p className="text-muted-foreground dark:text-gray-400 mb-6">
                Feel free to reach out to us directly or visit our office (by appointment). (Demo text)
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-primary dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Email Us (Demo)</h3>
                  <a href="mailto:support@letsgoapp.demo.com" className="text-muted-foreground dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors">
                    support@letsgoapp.demo.com
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-primary dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Call Us (Mon-Fri, 9am-5pm) (Demo)</h3>
                  <p className="text-muted-foreground dark:text-gray-400">+1 (555) 000-DEMO (Placeholder)</p>
                </div>
              </div>
              <div className="flex items-start">
                <LocationPin className="h-6 w-6 text-primary dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Our Office (Demo)</h3>
                  <p className="text-muted-foreground dark:text-gray-400">
                    123 Demo Drive, Suite 00<br />
                    Placeholder City, DC 98765 (Placeholder)
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Form Section (using the Client Component) */}
          <section>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">Send Us a Message (Demo)</h2>
            <ContactForm /> {/* Use the Client Component for the form here */}
          </section>
        </div>
      </main>

    </div>
  );
};

export default ContactPage;