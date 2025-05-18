import React from 'react';
import PassengerSupportContent from '@/components/passenger/PassengerSupportContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Passenger Support',
  description: 'Get help and support for your passenger account and rides.',
};

const PassengerSupportPage = () => {
  return (
    // Adjust container styling as per your app's layout structure if needed.
    <div className="container mx-auto py-6">
      <PassengerSupportContent />
    </div>
  );
};

export default PassengerSupportPage;