// frontend/lib/mockData/driverSettings.ts
import { DriverSettingsData } from '@/types';

// Mock data for a sample driver
export const mockDriverSettingsData: DriverSettingsData = {
  userId: 'driver789', // Corresponds to a mock driver ID
  notifications: {
    newBookingRequest: true,
    bookingConfirmed: true,
    bookingCancelledByPassenger: true,
    rideReminder: true,
    newMessageInChat: false,
    platformUpdates: true,
  },
  payout: {
    payoutMethod: 'BANK_ACCOUNT',
    bankAccountNumber: '**** **** **** 6789', // Masked
    bankRoutingNumber: '********1', // Masked
    paypalEmail: undefined, // Not set if bank account is primary
    payoutFrequency: 'WEEKLY',
  },
  preferences: {
    acceptInstantBook: false,
    allowPets: true,
    allowSmoking: false,
    maxLuggageSize: 'MEDIUM',
    musicPreference: 'PASSENGER_CHOICE',
  },
  // twoFactorAuthEnabled: false,
};

// Mock API function to fetch settings
export async function getMockDriverSettings(driverId: string, token: string): Promise<DriverSettingsData> {
  console.log(`[MOCK] Fetching driver settings for driverId: ${driverId} with token: ${token}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, you'd fetch based on driverId. Here, we just return the single mock object.
      // You could extend this to have multiple mock users if needed.
      if (driverId === mockDriverSettingsData.userId) {
        resolve(JSON.parse(JSON.stringify(mockDriverSettingsData))); // Deep copy
      } else {
        // Simulate not found or default settings for other users
        resolve({
          userId: driverId,
          notifications: {
            newBookingRequest: true, bookingConfirmed: true, bookingCancelledByPassenger: true,
            rideReminder: false, newMessageInChat: true, platformUpdates: true,
          },
          payout: {
            payoutMethod: 'NONE_SET', payoutFrequency: 'WEEKLY',
          },
          preferences: {
            acceptInstantBook: true, allowPets: false, allowSmoking: false,
            maxLuggageSize: 'MEDIUM', musicPreference: 'ANY',
          },
        });
      }
    }, 800);
  });
}

// Mock API function to update settings
export async function updateMockDriverSettings(
  driverId: string,
  settings: Omit<DriverSettingsData, 'userId'>, // Form values typically don't include userId
  token: string
): Promise<DriverSettingsData> {
  console.log(`[MOCK] Updating driver settings for driverId: ${driverId} with token: ${token}`, settings);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!settings.notifications || !settings.payout || !settings.preferences) {
        reject(new Error("Invalid settings payload."));
        return;
      }
      // Update our "global" mock object (not ideal for real state management, but fine for mock)
      if (driverId === mockDriverSettingsData.userId) {
        mockDriverSettingsData.notifications = { ...mockDriverSettingsData.notifications, ...settings.notifications };
        mockDriverSettingsData.payout = { ...mockDriverSettingsData.payout, ...settings.payout };
        mockDriverSettingsData.preferences = { ...mockDriverSettingsData.preferences, ...settings.preferences };
        resolve(JSON.parse(JSON.stringify(mockDriverSettingsData))); // Return updated deep copy
      } else {
        // For other users, just return what was sent as if it was saved
        resolve({ userId: driverId, ...settings });
      }
    }, 1200);
  });
}