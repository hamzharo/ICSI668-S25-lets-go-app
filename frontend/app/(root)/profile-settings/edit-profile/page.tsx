// frontend/app/(root)/profile-settings/edit-profile/page.tsx
'use client';

import { Separator } from "@/components/ui/separator";
import { EditProfileForm } from "./components/EditProfileForm";
import { ChangePasswordForm } from "./components/ChangePasswordForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/AuthContext";
import { User } from '@/types'; // Ensure User type is defined
import { Loader2 } from "lucide-react"; // For loading state
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// This page assumes it's part of a layout that handles authentication checks.
// It primarily fetches data for the forms.

export default function EditProfilePage() {
    const { user: authUser, isLoading: authLoading, token } = useAuth();
    // const [profileData, setProfileData] = useState<User | null>(null); // If fetching fresh profile data
    // const [isFetchingProfile, setIsFetchingProfile] = useState(true);

    // useEffect(() => {
    //     if (token && !authLoading) { // Only fetch if token exists and auth context is no longer loading
    //         const fetchUserProfileData = async () => {
    //             setIsFetchingProfile(true);
    //             try {
    //                 // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
    //                 //     headers: { 'Authorization': `Bearer ${token}` }
    //                 // });
    //                 // if (!response.ok) throw new Error("Failed to fetch profile");
    //                 // const data: User = await response.json();
    //                 // setProfileData(data);

    //                 // Mock: Use authUser directly if it's comprehensive enough
    //                 if (authUser) {
    //                     setProfileData(authUser);
    //                 } else {
    //                     throw new Error("User data not available in context.");
    //                 }

    //             } catch (error) {
    //                 console.error("Error fetching profile:", error);
    //                 toast.error("Could not load profile data.");
    //             } finally {
    //                 setIsFetchingProfile(false);
    //             }
    //         };
    //         fetchUserProfileData();
    //     } else if (!authLoading && !token) { // No token, not loading
    //         setIsFetchingProfile(false); // Stop fetching state
    //         // Redirect or error handling should be done by layout/middleware
    //     }
    // }, [authUser, token, authLoading]);

    // For simplicity, we'll directly use `authUser` if it's sufficient.
    // If `/api/users/me` returns more/different data than the JWT, you'd use the useEffect above.
    const isLoadingPage = authLoading; // || isFetchingProfile;
    const currentUserProfile = authUser; // profileData || authUser;


    if (isLoadingPage) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!currentUserProfile) {
        return (
            <div className="space-y-6 p-6 md:p-10 pb-16">
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Could not load user profile. Please try logging in again.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-8 lg:p-10 pb-16 max-w-4xl mx-auto"> {/* Added max-width and centering */}
            <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
                <p className="text-muted-foreground text-md">
                    Manage your account settings and personal preferences.
                </p>
            </div>
            <Separator className="my-8" /> {/* Increased margin */}

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:w-[400px] mb-6"> {/* Responsive TabsList */}
                    <TabsTrigger value="profile" className="py-2">Edit Profile</TabsTrigger>
                    <TabsTrigger value="password" className="py-2">Change Password</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <EditProfileForm currentUser={currentUserProfile} />
                </TabsContent>
                <TabsContent value="password">
                    <ChangePasswordForm />
                </TabsContent>
            </Tabs>
        </div>
    );
}