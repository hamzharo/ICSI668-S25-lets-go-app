'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // For dropdowns
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, AlertTriangle, Settings, Bell, Shield, DollarSign, Info, Loader2, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-toastify';

// Define the structure for mock system settings
interface MockSystemSettingsData {
  siteName: string;
  maintenanceMode: boolean;
  defaultCurrency: string;
  maxUploadSizeMB: number;
  emailNotificationsEnabled: boolean;
  adminEmail: string;
  driverVerificationRequired: boolean;
  baseCommissionRate: number; // Percentage
  // Add more settings as needed
}

interface SystemSettingsFormProps {
  initialSettings: MockSystemSettingsData;
  // onSave: (settings: MockSystemSettingsData) => Promise<void>; // For actual save
}

const SystemSettingsForm = ({ initialSettings }: SystemSettingsFormProps) => {
  const [settings, setSettings] = useState<MockSystemSettingsData>(initialSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' || type === 'switch' ? checked : (type === 'number' ? parseFloat(value) : value),
    }));
  };

  const handleSwitchChange = (name: keyof MockSystemSettingsData, checked: boolean) => {
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: keyof MockSystemSettingsData, value: string) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Demo: System Settings submitted:", settings);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    toast.success("System settings (demo) updated! In a real app, these would be saved.");
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleDemoSubmit} className="space-y-8">

        {/* General Settings Section */}
        <Card>
          <CardHeader>
            <div className='flex items-center'>
              <Settings className="h-6 w-6 mr-2 text-primary" />
              <CardTitle>General Site Settings</CardTitle>
            </div>
            <CardDescription>Configure basic settings for the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" name="siteName" value={settings.siteName} onChange={handleChange} placeholder="e.g., RideShare Platform" />
            </div>
            <div className="flex items-center justify-between space-x-2 p-3 border rounded-md">
                <div>
                    <Label htmlFor="maintenanceMode" className="font-medium">Maintenance Mode</Label>
                    <p className="text-xs text-muted-foreground">
                        Temporarily disable access to the site for users. Admins will still have access.
                    </p>
                </div>
              <Switch
                id="maintenanceMode"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSwitchChange('maintenanceMode', checked)}
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="adminEmail">Administrator Email</Label>
                <Input id="adminEmail" name="adminEmail" type="email" value={settings.adminEmail} onChange={handleChange} placeholder="admin@example.com" />
                <p className="text-xs text-muted-foreground">Primary contact for system alerts and notifications.</p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Financial Settings Section */}
        <Card>
          <CardHeader>
            <div className='flex items-center'>
                <DollarSign className="h-6 w-6 mr-2 text-primary" />
                <CardTitle>Financial Settings</CardTitle>
            </div>
            <CardDescription>Manage currency, commission, and payment gateway settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Select name="defaultCurrency" value={settings.defaultCurrency} onValueChange={(value) => handleSelectChange('defaultCurrency', value)}>
                <SelectTrigger id="defaultCurrency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - United States Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseCommissionRate">Base Commission Rate (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                    id="baseCommissionRate"
                    name="baseCommissionRate"
                    type="number"
                    value={settings.baseCommissionRate}
                    onChange={handleChange}
                    placeholder="e.g., 15"
                    min="0"
                    max="100"
                    step="0.1"
                />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" type="button" className="cursor-default">
                            <Info className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>The percentage the platform takes from each completed ride.</p>
                    </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* User & Security Settings Section */}
        <Card>
          <CardHeader>
            <div className='flex items-center'>
                <Shield className="h-6 w-6 mr-2 text-primary" />
                <CardTitle>User & Security Settings</CardTitle>
            </div>
            <CardDescription>Configure user registration, verification, and security parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2 p-3 border rounded-md">
                <div>
                    <Label htmlFor="driverVerificationRequired" className="font-medium">Driver Document Verification</Label>
                    <p className="text-xs text-muted-foreground">
                        Require drivers to upload and have documents verified before they can offer rides.
                    </p>
                </div>
              <Switch
                id="driverVerificationRequired"
                name="driverVerificationRequired"
                checked={settings.driverVerificationRequired}
                onCheckedChange={(checked) => handleSwitchChange('driverVerificationRequired', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxUploadSizeMB">Max Document Upload Size (MB)</Label>
              <Input
                id="maxUploadSizeMB"
                name="maxUploadSizeMB"
                type="number"
                value={settings.maxUploadSizeMB}
                onChange={handleChange}
                placeholder="e.g., 5"
                min="1"
              />
            </div>
          </CardContent>
        </Card>

         <Separator />

        {/* Notification Settings */}
        <Card>
          <CardHeader>
             <div className='flex items-center'>
                <Bell className="h-6 w-6 mr-2 text-primary" />
                <CardTitle>Notification Settings</CardTitle>
            </div>
            <CardDescription>Manage system-wide email notification preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between space-x-2 p-3 border rounded-md">
                <div>
                    <Label htmlFor="emailNotificationsEnabled" className="font-medium">Enable Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                        Send emails for bookings, cancellations, system updates, etc.
                    </p>
                </div>
                <Switch
                    id="emailNotificationsEnabled"
                    name="emailNotificationsEnabled"
                    checked={settings.emailNotificationsEnabled}
                    onCheckedChange={(checked) => handleSwitchChange('emailNotificationsEnabled', checked)}
                />
            </div>
          </CardContent>
        </Card>


        <CardFooter className="pt-8">
          <Button type="submit" disabled={isSubmitting} size="lg" className="w-full md:w-auto">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSubmitting ? 'Saving Settings...' : 'Save System Settings'}
          </Button>
        </CardFooter>
      </form>
    </TooltipProvider>
  );
};

export default SystemSettingsForm;