// frontend/app/contact/page.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MapPin as LocationPin, Phone, Send } from 'lucide-react'; // Renamed MapPin to avoid conflict

// If NOT using a shared PublicLayout, include Header/Footer here:
const PublicHeader = () => ( /* ... copy from PublicLayout example ... */ );
const PublicFooter = () => ( /* ... copy from PublicLayout example ... */ );

export const metadata = {
  title: "Contact Us | Let's GO",
  description: "Get in touch with the Let's GO team. We're here to help with any questions or feedback you have about our carpooling service.",
};


const ContactPage = () => {
  // Basic form handler (client-side only for this example)
  // In a real app, this would submit to a backend or a service like Formspree/Netlify Forms
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert("Thank you for your message! (This is a demo, no email was actually sent). We'll get back to you soon.");
    (event.target as HTMLFormElement).reset();
  };

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
            <Link href="/contact" className="text-sm font-medium text-primary dark:text-blue-400">Contact</Link>
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-blue-400">Login</Link>
            <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">Sign Up</Link>
          </div>
        </nav>
      </header>


      <main className="flex-grow container mx-auto px-4 py-12 md:py-16 lg:py-20">
        <section className="text-center mb-12 md:mb-16">
          <Mail className="h-16 w-16 text-primary dark:text-blue-400 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Get In Touch
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground dark:text-gray-400 max-w-2xl mx-auto">
            Have questions, feedback, or need support? We're here to help! Reach out to us through any of the channels below or use the contact form.
          </p>
        </section>

        <Separator className="my-8 md:my-12" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Contact Information Section */}
          <section className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">Contact Information</h2>
              <p className="text-muted-foreground dark:text-gray-400 mb-6">
                Feel free to reach out to us directly or visit our office (by appointment).
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-primary dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Email Us</h3>
                  <a href="mailto:support@letsgoapp.com" className="text-muted-foreground dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors">
                    support@letsgoapp.com
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-primary dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Call Us (Mon-Fri, 9am-5pm)</h3>
                  <p className="text-muted-foreground dark:text-gray-400">+1 (555) 123-4567 (Placeholder)</p>
                </div>
              </div>
              <div className="flex items-start">
                <LocationPin className="h-6 w-6 text-primary dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Our Office</h3>
                  <p className="text-muted-foreground dark:text-gray-400">
                    123 Carpool Lane, Suite 100<br />
                    Innovation City, ST 54321 (Placeholder)
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Form Section */}
          <section>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <Input id="name" name="name" type="text" placeholder="Your Name" required className="mt-1"/>
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required className="mt-1"/>
                </div>
              </div>
              <div>
                <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                <Input id="subject" name="subject" type="text" placeholder="Regarding..." required className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                <Textarea id="message" name="message" placeholder="Your message here..." required rows={5} className="mt-1"/>
              </div>
              <div>
                <Button type="submit" size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                  <Send className="mr-2 h-4 w-4"/> Send Message
                </Button>
              </div>
            </form>
          </section>
        </div>
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

export default ContactPage;