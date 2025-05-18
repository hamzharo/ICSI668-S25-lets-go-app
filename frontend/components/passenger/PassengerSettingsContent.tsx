'use client';

import React, { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input"; // For things like "Change Password"
import {
    Mail, // For Email Notifications
    Bell, // For Push Notifications
    Lock, // For Security/Privacy
    UserCircle, // For Profile related settings
    Trash2, // For Delete Account
    Palette, // For Appearance
} from 'lucide-react';
import Link from 'next/link';

// Define a type for individual settings for better type safety
interface SettingItem<T> {
    id: string;
    label: string;
    description?: string;
    icon?: React.ElementType;
    type: 'toggle' | 'button' | 'link' | 'inputGroup'; // Add more types as needed
    value?: T; // For toggles, input initial values
    action?: () => void; // For buttons
    href?: string; // For links
    placeholder?: string; // For inputs
    inputType?: string; // For inputs (e.g., "password")
}

// Mock settings initial state
const initialPassengerSettings = {
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    promotionalEmails: true,

    // Privacy Settings
    shareRideActivity: true,
    profileVisibility: 'public', // could be 'public', 'contacts_only', 'private'

    // Account Settings (values might not be directly stored here but actions)
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
};

const PassengerSettingsContent = () => {
    const [settings, setSettings] = useState(initialPassengerSettings);

    const handleToggleChange = (key: keyof typeof initialPassengerSettings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
        // In a real app, you'd call an API to save this setting
        console.log(`Setting ${key} changed to: ${!settings[key]}`);
    };

    const handleInputChange = (key: keyof typeof initialPassengerSettings, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleChangePassword = () => {
        if (settings.newPassword !== settings.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }
        if (!settings.currentPassword || !settings.newPassword) {
            alert("Please fill in all password fields.");
            return;
        }
        console.log("Attempting to change password with:", {
            currentPassword: settings.currentPassword,
            newPassword: settings.newPassword,
        });
        // In a real app, call API to change password
        alert("Password change initiated (mock). Check console.");
        // Clear password fields after mock submission
        setSettings(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        }));
    };

    const handleDeleteAccount = () => {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            console.log("Attempting to delete account (mock).");
            // In a real app, call API to delete account and then log out/redirect
            alert("Account deletion initiated (mock). You would be logged out.");
        }
    };

    const notificationSettings: SettingItem<boolean>[] = [
        { id: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates about your bookings and important alerts via email.', type: 'toggle', value: settings.emailNotifications, icon: Mail },
        { id: 'pushNotifications', label: 'Push Notifications', description: 'Get instant alerts on your mobile device (if app is installed).', type: 'toggle', value: settings.pushNotifications, icon: Bell },
        { id: 'promotionalEmails', label: 'Promotional Emails', description: 'Receive news, offers, and updates from us.', type: 'toggle', value: settings.promotionalEmails, icon: Mail },
    ];

    const privacySettingsItems: SettingItem<boolean | string>[] = [
        { id: 'shareRideActivity', label: 'Share Ride Activity', description: 'Allow sharing of your ride activity with selected contacts (feature mock).', type: 'toggle', value: settings.shareRideActivity, icon: UserCircle },
        // Example for a select-like setting (you'd need a custom select or shadcn/ui Select for real use)
        // For now, just showing as text, or you could make it a link to a more detailed page
        { id: 'profileVisibility', label: 'Profile Visibility', description: `Current: ${settings.profileVisibility}. Manage who can see your profile.`, type: 'link', href: '/passenger/settings/privacy', icon: Lock },
    ];

    const appearanceSettingsItems: SettingItem<any>[] = [
        { id: 'theme', label: 'Theme', description: 'Select your preferred theme (Light/Dark - Mock).', type: 'button', action: () => alert("Theme switcher clicked (mock)"), icon: Palette },
    ];


    return (
        <div className="space-y-8 max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Passenger Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Bell className="mr-2 h-5 w-5" />
                        Notification Settings
                    </CardTitle>
                    <CardDescription>Manage how you receive notifications from us.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {notificationSettings.map(item => (
                        <div key={item.id} className="flex items-center justify-between space-x-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                            <div className="flex items-start space-x-3">
                                {item.icon && <item.icon className="h-5 w-5 mt-1 text-muted-foreground" />}
                                <div>
                                    <Label htmlFor={item.id} className="font-medium text-card-foreground">{item.label}</Label>
                                    {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                                </div>
                            </div>
                            {item.type === 'toggle' && (
                                <Switch
                                    id={item.id}
                                    checked={item.value}
                                    onCheckedChange={() => handleToggleChange(item.id as keyof typeof initialPassengerSettings)}
                                />
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Lock className="mr-2 h-5 w-5" />
                        Privacy Settings
                    </CardTitle>
                    <CardDescription>Control your privacy and data sharing preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {privacySettingsItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between space-x-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                            <div className="flex items-start space-x-3">
                                {item.icon && <item.icon className="h-5 w-5 mt-1 text-muted-foreground" />}
                                <div>
                                    <Label htmlFor={item.id} className="font-medium text-card-foreground">{item.label}</Label>
                                    {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                                </div>
                            </div>
                            {item.type === 'toggle' && typeof item.value === 'boolean' && (
                                <Switch
                                    id={item.id}
                                    checked={item.value}
                                    onCheckedChange={() => handleToggleChange(item.id as keyof typeof initialPassengerSettings)}
                                />
                            )}
                            {item.type === 'link' && item.href && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={item.href}>Manage</Link>
                                </Button>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Palette className="mr-2 h-5 w-5" />
                        Appearance
                    </CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     {appearanceSettingsItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between space-x-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                            <div className="flex items-start space-x-3">
                                {item.icon && <item.icon className="h-5 w-5 mt-1 text-muted-foreground" />}
                                <div>
                                    <Label htmlFor={item.id} className="font-medium text-card-foreground">{item.label}</Label>
                                    {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                                </div>
                            </div>
                            {item.type === 'button' && item.action && (
                                <Button variant="outline" size="sm" onClick={item.action}>
                                    {item.label.startsWith("Theme") ? "Change Theme" : "Configure"}
                                </Button>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <UserCircle className="mr-2 h-5 w-5" />
                        Account Management
                    </CardTitle>
                    <CardDescription>Manage your account details and security.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                            id="currentPassword"
                            type="password"
                            value={settings.currentPassword}
                            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                            placeholder="Enter your current password"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={settings.newPassword}
                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                            placeholder="Enter your new password"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={settings.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            placeholder="Confirm your new password"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button onClick={handleChangePassword}>Change Password</Button>
                </CardFooter>
            </Card>

            <Separator />

            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center text-destructive">
                        <Trash2 className="mr-2 h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Deleting your account is a permanent action and cannot be undone.
                        All your data, including ride history and preferences, will be erased.
                    </p>
                    <Button variant="destructive" onClick={handleDeleteAccount} className="w-full sm:w-auto">
                        Delete My Account
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default PassengerSettingsContent;