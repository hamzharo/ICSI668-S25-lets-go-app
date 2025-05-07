// frontend/app/landing/page.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button'; // Using ShadCN Button
import { ArrowRight, ShieldCheck, Users, Zap, Leaf } from 'lucide-react';

export const metadata = {
  title: "Welcome to Let's GO | Share Your Ride, Share the Cost",
  description: "Discover Let's GO - the easy, affordable, and eco-friendly carpooling platform. Find drivers or passengers heading your way and make your travel better.",
};

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/icons/logo.png" width={36} height={36} alt="Let's GO Logo" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">Let's GO</span>
          </Link>
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
              Contact
            </Link>
            <Link href="/login" passHref legacyBehavior>
              <Button variant="ghost" size="sm" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-blue-400">Login</Button>
            </Link>
            <Link href="/register" passHref legacyBehavior>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Sign Up <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-32 lg:pb-36 bg-gradient-to-b from-sky-50 via-slate-50 to-white dark:from-slate-800 dark:via-slate-800/50 dark:to-slate-900">
          <div className="absolute inset-0 opacity-50 dark:opacity-20">
            {/* Optional subtle background pattern or image here */}
            {/* <Image src="/images/world-map-dots.svg" layout="fill" objectFit="cover" alt="background pattern" /> */}
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Share Your Ride. <span className="block sm:inline text-primary dark:text-blue-400">Share the Cost.</span>
            </h1>
            <p className="mt-6 max-w-xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-300">
              Join Let's GO, the smart carpooling community. Effortlessly connect with drivers and passengers, making every journey more affordable, eco-friendly, and enjoyable.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href="/register" passHref legacyBehavior>
                <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-base px-8 py-3 shadow-lg transform hover:scale-105 transition-transform">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/search-rides" passHref legacyBehavior> {/* Link to search if user just wants to browse */}
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-3 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/50 transform hover:scale-105 transition-transform">
                  Find a Ride <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Why Choose Let's GO?</h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                We're dedicated to providing a seamless and trustworthy carpooling experience.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              <div className="feature-card p-6 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 dark:bg-blue-500/20 text-primary dark:text-blue-400 mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Safe & Verified</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Driver verification and community reviews help ensure a secure journey for everyone.
                </p>
              </div>
              <div className="feature-card p-6 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 mb-4">
                  <Leaf className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Eco-Friendly</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Reduce your carbon footprint by sharing rides and making travel more sustainable.
                </p>
              </div>
              <div className="feature-card p-6 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 mb-4">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Cost-Effective</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Save money on fuel and vehicle maintenance by sharing travel expenses.
                </p>
              </div>
              <div className="feature-card p-6 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Community Focused</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Connect with fellow travelers, make new friends, and enjoy a more social commute.
                </p>
              </div>
              <div className="feature-card p-6 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Easy to Use</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Our intuitive platform makes finding or offering a ride quick and hassle-free.
                </p>
              </div>
              <div className="feature-card p-6 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 mb-4">
                    <MapPin className="h-6 w-6"/>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Flexible Options</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Find rides for daily commutes, weekend trips, or long-distance travel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 md:py-24 bg-slate-100 dark:bg-slate-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Ready to Start Your Journey with Let's GO?
            </h2>
            <p className="max-w-xl mx-auto text-lg text-slate-600 dark:text-slate-300 mb-8">
              Whether you're looking to save money, reduce your environmental impact, or simply enjoy a more social commute, Let's GO is here to connect you.
            </p>
            <Link href="/register" passHref legacyBehavior>
              <Button size="lg" className="bg-primary hover:bg-primary/80 text-primary-foreground text-base px-10 py-3 shadow-lg transform hover:scale-105 transition-transform">
                Sign Up Now and Share Your First Ride!
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="mb-4 md:mb-0">
              <Link href="/" className="flex items-center justify-center md:justify-start gap-2">
                <Image src="/icons/logo.png" width={28} height={28} alt="Let's GO Logo" />
                <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">Let's GO</span>
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Making travel better, together.</p>
            </div>
            <div className="flex space-x-4 mb-4 md:mb-0">
              <Link href="/about" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-blue-400">About</Link>
              <Link href="/contact" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-blue-400">Contact</Link>
              <Link href="/privacy" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-blue-400">Privacy</Link>
              <Link href="/terms" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-blue-400">Terms</Link>
            </div>
            {/* Optional: Social Media Icons */}
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Let's GO CarSharing. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;