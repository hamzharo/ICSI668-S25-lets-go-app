// frontend/components/driver/DriverEditProfileForm.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, DriverProfileUpdateRequest } from '@/types'; // Assuming this type for updates
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Loader2, Save, Trash2, UserCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Separator } from '../ui/separator'; // Assuming you have Separator

// --- Mock API Call (Replace with actual) ---
// Assume an API function to update the profile
const mockUpdateDriverProfile = async (userId: string, data: DriverProfileUpdateRequest, profilePicture?: File): Promise<User> => {
  console.log("MOCK API: Updating driver profile for user:", userId);
  console.log("Data:", data);
  if (profilePicture) {
    console.log("Profile Picture to upload:", profilePicture.name, profilePicture.size, "bytes");
  }
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

  // Return updated user data (mocked)
  const updatedUser: User = {
    id: userId,
    email: data.email || 'current-email@example.com', // Email usually not changed here
    firstName: data.firstName || 'UpdatedFirst',
    lastName: data.lastName || 'UpdatedLast',
    username: data.username || 'updated_username',
    phoneNumber: data.phoneNumber || '',
    bio: data.bio || '',
    role: 'DRIVER', // Assuming role doesn't change here
    profilePictureUrl: profilePicture ? URL.createObjectURL(profilePicture) : data.currentProfilePictureUrl || 'https://avatar.vercel.sh/updated.png', // Simulate new URL
    // ... any other fields from User type
  };
  // If successful:
  // toast.success("Profile updated successfully!");
  // If error:
  // toast.error("Failed to update profile.");
  return updatedUser;
};
// --- End Mock API Call ---


interface DriverEditProfileFormProps {
  currentUser: User; // Pass the current user data
  onProfileUpdate?: (updatedUser: User) => void; // Callback after successful update
}

const DriverEditProfileForm = ({ currentUser, onProfileUpdate }: DriverEditProfileFormProps) => {
  const [formData, setFormData] = useState<DriverProfileUpdateRequest>({
    firstName: currentUser.firstName || '',
    lastName: currentUser.lastName || '',
    username: currentUser.username || '', // If username is editable
    email: currentUser.email, // Typically read-only here or handled in account settings
    phoneNumber: currentUser.phoneNumber || '',
    bio: currentUser.bio || '',
    currentProfilePictureUrl: currentUser.profilePictureUrl,
  });

  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(currentUser.profilePictureUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview if currentUser.profilePictureUrl changes from parent
  useEffect(() => {
    setPreviewImageUrl(currentUser.profilePictureUrl || null);
    setFormData(prev => ({ ...prev, currentProfilePictureUrl: currentUser.profilePictureUrl }));
  }, [currentUser.profilePictureUrl]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Basic validation (optional)
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        toast.error("Image size should be less than 2MB.");
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error("Invalid image format. Please use JPG, PNG, or WEBP.");
        return;
      }
      setProfilePictureFile(file);
      setPreviewImageUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePictureFile(null);
    setPreviewImageUrl(null); // Or set to a default placeholder
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
    }
    // You might need a way to tell the backend to delete the picture
    // For now, this just clears it on the client.
    setFormData(prev => ({ ...prev, currentProfilePictureUrl: undefined })); // Indicate removal to backend if it uses this field
    toast.info("Profile picture removed (preview). Save to apply changes.");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.info("Updating profile...", { autoClose: 1500 });

    try {
      const updatedUser = await mockUpdateDriverProfile(currentUser.id, formData, profilePictureFile || undefined);
      toast.success("Profile updated successfully!");
      if (onProfileUpdate) {
        onProfileUpdate(updatedUser); // Update parent state if needed (e.g., in AuthContext)
      }
      // If pic was uploaded, backend might return new URL. Update preview with actual new URL.
      // For mock, we simulated this in mockUpdateDriverProfile
      setPreviewImageUrl(updatedUser.profilePictureUrl || null);
      setProfilePictureFile(null); // Clear staged file
    } catch (error: any) {
      console.error("Profile update failed:", error);
      toast.error(error.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const f = firstName?.[0] || '';
    const l = lastName?.[0] || '';
    return (f + l).toUpperCase() || (currentUser.username?.[0] || '?').toUpperCase();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center">
            <UserCircle className="h-7 w-7 mr-2 text-primary" />
            Edit Driver Profile
        </CardTitle>
        <CardDescription>Keep your personal information up to date.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {/* Profile Picture Section */}
          <div className="space-y-2 flex flex-col items-center">
            <Label htmlFor="profilePicture" className="text-base font-medium self-start mb-2">Profile Picture</Label>
            <div className="relative group w-32 h-32 md:w-40 md:h-40">
              <Avatar className="w-full h-full text-4xl md:text-5xl border-2 border-muted">
                <AvatarImage src={previewImageUrl || undefined} alt="Profile Preview" />
                <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                  {getInitials(formData.firstName, formData.lastName)}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm group-hover:bg-background"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change profile picture"
              >
                <Camera className="h-5 w-5" />
              </Button>
              <input
                type="file"
                id="profilePicture"
                ref={fileInputRef}
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                onChange={handleProfilePictureChange}
              />
            </div>
            {previewImageUrl && (
              <Button type="button" variant="ghost" size="sm" onClick={handleRemoveProfilePicture} className="text-xs text-red-500 hover:text-red-600">
                <Trash2 className="h-3 w-3 mr-1" /> Remove Picture
              </Button>
            )}
            <p className="text-xs text-muted-foreground text-center mt-1">Recommended: Square image, JPG, PNG, or WEBP, under 2MB.</p>
          </div>

          <Separator />

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h4 className="text-base font-medium">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="e.g., John" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="e.g., Doe" required />
              </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="username">Username (Optional)</Label>
                <Input id="username" name="username" value={formData.username} onChange={handleInputChange} placeholder="e.g., johndoe99" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" value={formData.email} readOnly disabled className="bg-muted/50 dark:bg-gray-700/50 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} placeholder="e.g., +1 (555) 123-4567" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio / About Me (Optional)</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell passengers a little about yourself..."
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">Max 200 characters (example limit).</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t pt-6">
          <Button type="submit" disabled={isSubmitting} size="lg" className="w-full md:w-auto">
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default DriverEditProfileForm;