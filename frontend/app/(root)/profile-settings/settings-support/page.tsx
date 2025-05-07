// app/(root)/profile-settings/settings-support/page.tsx
'use client';
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettings } from "./components/NotificationSettings";
import { AccountSettings } from "./components/AccountSettings";
import { SupportSection } from "./components/SupportSection";
import { AppearanceSettings } from "./components/AppearanceSettings"; // Optional

export default function SettingsSupportPage() {
    return (
        <div className="space-y-6 p-6 md:p-10 pb-16">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Settings & Support</h2>
                <p className="text-muted-foreground">
                    Manage your application settings, account preferences, and find help.
                </p>
            </div>
            <Separator className="my-6" />

            <Tabs defaultValue="notifications" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4"> {/* Adjust grid-cols as needed */}
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="support">Support & FAQ</TabsTrigger>
                </TabsList>

                <TabsContent value="notifications" className="mt-6">
                    <NotificationSettings />
                </TabsContent>
                <TabsContent value="appearance" className="mt-6">
                    <AppearanceSettings />
                </TabsContent>
                <TabsContent value="account" className="mt-6">
                    <AccountSettings />
                </TabsContent>
                <TabsContent value="support" className="mt-6">
                    <SupportSection />
                </TabsContent>
            </Tabs>
        </div>
    );
}