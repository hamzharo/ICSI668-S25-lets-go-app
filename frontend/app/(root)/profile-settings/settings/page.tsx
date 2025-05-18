// frontend/app/(root)/driver/profile-settings/settings/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import {
  DriverSettingsData,
  DriverSettingsFormValues,
  DriverNotificationSettings,
  DriverPayoutSettings,
  DriverPreferences,
} from '@/types';
import { getMockDriverSettings, updateMockDriverSettings } from "@/lib/mockData/driverSettings"

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; // For payout details if we were to edit them
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

// Zod Schemas for validation
const notificationSettingsSchema = z.object({
  newBookingRequest: z.boolean(),
  bookingConfirmed: z.boolean(),
  bookingCancelledByPassenger: z.boolean(),
  rideReminder: z.boolean(),
  newMessageInChat: z.boolean(),
  platformUpdates: z.boolean(),
});

const payoutSettingsSchema = z.object({
  payoutMethod: z.enum(['BANK_ACCOUNT', 'PAYPAL', 'NONE_SET']),
  bankAccountNumber: z.string().optional().or(z.literal('')), // Masked, so not heavily validated on frontend
  bankRoutingNumber: z.string().optional().or(z.literal('')), // Masked
  paypalEmail: z.string().email({ message: "Invalid PayPal email" }).optional().or(z.literal('')),
  payoutFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
}).refine(data => {
    if (data.payoutMethod === 'PAYPAL' && !data.paypalEmail) {
        return false; // If PayPal, email is required
    }
    // Could add more complex validation for bank details if they weren't masked
    return true;
}, {
    message: "PayPal email is required if PayPal is selected payout method.",
    path: ["paypalEmail"], // Point error to paypalEmail field
});


const preferencesSchema = z.object({
  acceptInstantBook: z.boolean(),
  allowPets: z.boolean(),
  allowSmoking: z.boolean(),
  maxLuggageSize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'NONE']),
  musicPreference: z.enum(['PASSENGER_CHOICE', 'DRIVER_CHOICE', 'QUIET_RIDE', 'ANY']),
});

const driverSettingsFormSchema = z.object({
  notifications: notificationSettingsSchema,
  payout: payoutSettingsSchema,
  preferences: preferencesSchema,
});


export default function DriverSettingsPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialSettings, setInitialSettings] = useState<DriverSettingsData | null>(null);

  const { control, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<DriverSettingsFormValues>({
    resolver: zodResolver(driverSettingsFormSchema),
    defaultValues: async () => {
      // Default values will be set by reset(data) in useEffect once data is fetched
      // Providing some fallback defaults here for the initial render before data loads
      return {
        notifications: { newBookingRequest: true, bookingConfirmed: true, bookingCancelledByPassenger: true, rideReminder: false, newMessageInChat: true, platformUpdates: true },
        payout: { payoutMethod: 'NONE_SET', payoutFrequency: 'WEEKLY', bankAccountNumber: '', bankRoutingNumber: '', paypalEmail: '' },
        preferences: { acceptInstantBook: false, allowPets: false, allowSmoking: false, maxLuggageSize: 'MEDIUM', musicPreference: 'ANY' },
      };
    }
  });
  
  const currentPayoutMethod = watch("payout.payoutMethod");

  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        toast.error("You must be logged in to access settings.");
        router.push('/login');
        return;
      }
      if (!user.roles?.includes('DRIVER')) {
        toast.warn("These settings are for drivers only.");
        // router.push('/driver'); // or passenger dashboard
        // For now, let's allow viewing, but a real app might restrict harder
      }

      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          const settings = await getMockDriverSettings(user.id, token);
          setInitialSettings(settings);
          // Destructure to match form structure if `settings` directly matches `DriverSettingsFormValues`
          // Otherwise, map `settings` (DriverSettingsData) to `DriverSettingsFormValues`
          const formValues: DriverSettingsFormValues = {
            notifications: settings.notifications,
            payout: settings.payout,
            preferences: settings.preferences,
          };
          reset(formValues); // Populate form with fetched data
        } catch (error) {
          console.error("Failed to load driver settings:", error);
          toast.error("Could not load your settings. Please try again later.");
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    }
  }, [user, token, authLoading, router, reset]);

  const onSubmit: SubmitHandler<DriverSettingsFormValues> = async (data) => {
    if (!user || !token) {
      toast.error("Authentication error.");
      return;
    }
    setIsSubmitting(true);
    try {
      const updatedSettings = await updateMockDriverSettings(user.id, data, token);
      setInitialSettings(updatedSettings); // Update local state for initial settings
      reset(data); // Reset form with new data to clear dirty state
      toast.success("Settings updated successfully!");
    } catch (error: any) {
      console.error("Failed to update settings:", error);
      toast.error(error.message || "Failed to update settings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingData) {
    return (
      <div className="flex flex-grow items-center justify-center p-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading settings...</p>
      </div>
    );
  }

  if (!initialSettings) {
    return (
      <div className="p-10 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-xl">Could not load driver settings.</p>
        <p className="text-muted-foreground">Please try refreshing the page or contact support if the issue persists.</p>
      </div>
    );
  }
  

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Driver Settings</h1>
        <p className="text-muted-foreground">Manage your notification, payout, and ride preferences.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* Notification Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Choose how you want to be notified about important events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(Object.keys(initialSettings.notifications) as Array<keyof DriverNotificationSettings>).map((key) => (
              <div key={key} className="flex items-center justify-between space-x-2">
                <Label htmlFor={`notifications.${key}`} className="flex flex-col space-y-1">
                  <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                  <span className="font-normal leading-snug text-muted-foreground text-xs">
                    {/* Add more descriptive text if needed */}
                    Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}.
                  </span>
                </Label>
                <Controller
                  name={`notifications.${key}`}
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id={`notifications.${key}`}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            ))}
            {errors.notifications && <p className="text-sm text-red-500 mt-1">Error in notification settings.</p>}
          </CardContent>
        </Card>

        <Separator />

        {/* Payout Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Payout Settings</CardTitle>
            <CardDescription>Configure how you receive your earnings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Payout Method</Label>
              <Controller
                name="payout.payoutMethod"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col sm:flex-row gap-4 mt-2"
                  >
                    <Label className="flex items-center space-x-2 border p-3 rounded-md has-[:checked]:border-primary cursor-pointer flex-1">
                      <RadioGroupItem value="BANK_ACCOUNT" id="payoutBank" />
                      <span>Bank Account</span>
                    </Label>
                    <Label className="flex items-center space-x-2 border p-3 rounded-md has-[:checked]:border-primary cursor-pointer flex-1">
                      <RadioGroupItem value="PAYPAL" id="payoutPaypal" />
                      <span>PayPal</span>
                    </Label>
                     <Label className="flex items-center space-x-2 border p-3 rounded-md has-[:checked]:border-primary cursor-pointer flex-1">
                      <RadioGroupItem value="NONE_SET" id="payoutNone" />
                      <span>None Set</span>
                    </Label>
                  </RadioGroup>
                )}
              />
              {errors.payout?.payoutMethod && <p className="text-sm text-red-500 mt-1">{errors.payout.payoutMethod.message}</p>}
            </div>

            {currentPayoutMethod === 'BANK_ACCOUNT' && (
              <>
                <div className="opacity-70 pointer-events-none"> {/* Fields are read-only as per mock */}
                  <Label htmlFor="payout.bankAccountNumber">Bank Account Number (Masked)</Label>
                  <Input id="payout.bankAccountNumber" {...control.register("payout.bankAccountNumber")} readOnly placeholder="**** **** **** 1234" />
                </div>
                <div className="opacity-70 pointer-events-none">
                  <Label htmlFor="payout.bankRoutingNumber">Routing Number (Masked)</Label>
                  <Input id="payout.bankRoutingNumber" {...control.register("payout.bankRoutingNumber")} readOnly placeholder="********1"/>
                </div>
                <p className="text-xs text-muted-foreground">To change bank details, please contact support.</p>
              </>
            )}
            {currentPayoutMethod === 'PAYPAL' && (
              <div>
                <Label htmlFor="payout.paypalEmail">PayPal Email</Label>
                <Input id="payout.paypalEmail" type="email" {...control.register("payout.paypalEmail")} placeholder="yourname@example.com" />
                {errors.payout?.paypalEmail && <p className="text-sm text-red-500 mt-1">{errors.payout.paypalEmail.message}</p>}
              </div>
            )}

            <div>
              <Label htmlFor="payout.payoutFrequency">Payout Frequency</Label>
              <Controller
                name="payout.payoutFrequency"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="payout.payoutFrequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.payout?.payoutFrequency && <p className="text-sm text-red-500 mt-1">{errors.payout.payoutFrequency.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Ride Preferences Card */}
        <Card>
          <CardHeader>
            <CardTitle>Ride Preferences</CardTitle>
            <CardDescription>Set preferences for the rides you offer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="preferences.acceptInstantBook" className="flex flex-col space-y-1">
                <span>Accept Instant Book</span>
                <span className="font-normal leading-snug text-muted-foreground text-xs">Allow passengers to book without your manual approval.</span>
              </Label>
              <Controller name="preferences.acceptInstantBook" control={control} render={({ field }) => <Switch id="preferences.acceptInstantBook" checked={field.value} onCheckedChange={field.onChange} />} />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="preferences.allowPets" className="flex flex-col space-y-1">
                <span>Allow Pets</span>
                <span className="font-normal leading-snug text-muted-foreground text-xs">Specify if passengers can bring pets.</span>
              </Label>
              <Controller name="preferences.allowPets" control={control} render={({ field }) => <Switch id="preferences.allowPets" checked={field.value} onCheckedChange={field.onChange} />} />
            </div>
             <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="preferences.allowSmoking" className="flex flex-col space-y-1">
                <span>Allow Smoking</span>
                <span className="font-normal leading-snug text-muted-foreground text-xs">Specify if smoking is allowed during rides.</span>
              </Label>
              <Controller name="preferences.allowSmoking" control={control} render={({ field }) => <Switch id="preferences.allowSmoking" checked={field.value} onCheckedChange={field.onChange} />} />
            </div>
            <div>
              <Label htmlFor="preferences.maxLuggageSize">Max Luggage Size</Label>
               <Controller
                name="preferences.maxLuggageSize"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="preferences.maxLuggageSize"><SelectValue placeholder="Select max luggage size" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">None</SelectItem>
                      <SelectItem value="SMALL">Small (Backpack)</SelectItem>
                      <SelectItem value="MEDIUM">Medium (Carry-on)</SelectItem>
                      <SelectItem value="LARGE">Large (Checked Bag)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="preferences.musicPreference">Music Preference</Label>
               <Controller
                name="preferences.musicPreference"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="preferences.musicPreference"><SelectValue placeholder="Select music preference" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ANY">Any / Flexible</SelectItem>
                      <SelectItem value="PASSENGER_CHOICE">Passenger's Choice</SelectItem>
                      <SelectItem value="DRIVER_CHOICE">Driver's Choice</SelectItem>
                      <SelectItem value="QUIET_RIDE">Quiet Ride (No Music)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end border-t pt-6 mt-6">
          <Button type="submit" disabled={isSubmitting || !isDirty} size="lg">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4"/>
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </div>
  );
}