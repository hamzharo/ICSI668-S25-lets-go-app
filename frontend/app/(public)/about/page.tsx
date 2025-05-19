// frontend/app/about/page.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // For "Let's GO" logo
import { Separator } from '@/components/ui/separator';
import { Users, Rocket, Handshake, Leaf } from 'lucide-react'; // Example icons


export const metadata = { // Per-page metadata
  title: "About Us | Let's GO",
  description: "Learn more about Let's GO, our mission, values, and the team dedicated to making carpooling easy and accessible.",
};

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* <PublicHeader /> Use this if you created PublicLayout.tsx */}
       {/* <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/80 backdrop-blur-sm">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/icons/logo.png" width={36} height={36} alt="Let's GO Logo" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">Let's GO</span>
          </Link>
          <div className="space-x-2 sm:space-x-4">
            <Link href="/about" className="text-sm font-medium text-primary dark:text-blue-400">About</Link>
            <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-blue-400">Contact</Link>
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-blue-400">Login</Link>
            <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">Sign Up</Link>
          </div>
        </nav>
      </header> */}

      <main className="flex-grow container mx-auto px-4 py-12 md:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto">
          <section className="text-center mb-12 md:mb-16">
            <Rocket className="h-16 w-16 text-primary dark:text-blue-400 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              About Let's GO
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground dark:text-gray-400">
              Revolutionizing travel by connecting drivers with empty seats to passengers heading the same way.
            </p>
          </section>

          <Separator className="my-8 md:my-12" />

          <section className="mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center">Our Mission</h2>
            <div className="text-base md:text-lg leading-relaxed space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                At Let's GO, our mission is to make travel more affordable, sustainable, and social. We believe in the power of shared mobility to reduce traffic congestion, lower carbon emissions, and build communities on the go. We strive to provide a safe, reliable, and user-friendly platform for everyone.
              </p>
              <p>
                We aim to create a world where every car journey is an opportunity for connection and shared experience, making travel not just a means to an end, but a part of the adventure.
              </p>
            </div>
          </section>

          <Separator className="my-8 md:my-12" />

          <section className="mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-4">
                <Handshake className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-xl font-medium mb-2">Community</h3>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Fostering connections and trust among our users.</p>
              </div>
              <div className="p-4">
                <Leaf className="h-12 w-12 text-teal-500 mx-auto mb-3" />
                <h3 className="text-xl font-medium mb-2">Sustainability</h3>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Promoting eco-friendly travel by optimizing vehicle occupancy.</p>
              </div>
              <div className="p-4">
                <Users className="h-12 w-12 text-indigo-500 mx-auto mb-3" />
                <h3 className="text-xl font-medium mb-2">Accessibility</h3>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Making travel affordable and convenient for everyone.</p>
              </div>
            </div>
          </section>

          {/* Optional: Team Section
          <Separator className="my-8 md:my-12" />
          <section>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center">Meet the Team (Placeholder)</h2>
            <p className="text-center text-muted-foreground dark:text-gray-400">
              We are a passionate group of innovators dedicated to improving your travel experience...
            </p>
          </section>
          */}
        </div>
      </main>

      {/* <PublicFooter /> Use this if you created PublicLayout.tsx */}
      {/* <footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Let's GO CarSharing. All Rights Reserved.</p>
            <div className="mt-2 space-x-4"> <Link href="/privacy" className="hover:underline">Privacy Policy</Link> <span>|</span> <Link href="/terms" className="hover:underline">Terms of Service</Link> </div>
        </div>
      </footer> */}
    </div>
  );
};

export default AboutPage;