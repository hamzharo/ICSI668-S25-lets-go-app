import React from 'react';
import PassengerSettingsContent from '@/components/passenger/PassengerSettingsContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Passenger Settings',
  description: 'Manage your passenger account settings.',
};

const PassengerSettingsPage = () => {
  return (
    // You might have a common layout for passenger pages that provides padding,
    // but the SettingsContent component itself adds some padding and max-width.
    // Adjust container styling as per your app's layout structure.
    <div className="container mx-auto py-6">
      <PassengerSettingsContent />
    </div>
  );
};

export default PassengerSettingsPage;