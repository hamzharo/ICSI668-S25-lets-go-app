'use client';

import React, { useState, useEffect } from 'react';
// import { User, DriverProfile } from '@/types'; // Assuming DriverProfile type exists or can be added
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, UserCircle, Car, Landmark, FileText, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { toast } from 'react-toastify';

// Define a more specific type for the driver's completion status / profile data for the form
// This would typically come from your User object or a separate DriverProfile object
interface MockDriverCompletionData {
  // From User
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string; // Assuming User might have this

  // From DriverProfile (or equivalent)
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleLicensePlate?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  drivingLicenseStatus?: 'UPLOADED' | 'PENDING' | 'VERIFIED' | 'MISSING';
  // Add more fields as needed for your "complete account" flow
}

interface DriverCompleteAccountFormProps {
  initialDriverData: MockDriverCompletionData; // Initial data for the form (mocked)
  // onSave: (data: MockDriverCompletionData) => Promise<void>; // For actual save, not needed for pure demo
}

const DriverCompleteAccountForm = ({ initialDriverData }: DriverCompleteAccountFormProps) => {
  const [formData, setFormData] = useState<MockDriverCompletionData>(initialDriverData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // For demo, we can simulate completion status
  const [completionStatus, setCompletionStatus] = useState({
    personalDetails: !!(initialDriverData.firstName && initialDriverData.lastName && initialDriverData.phoneNumber),
    vehicleInfo: !!(initialDriverData.vehicleMake && initialDriverData.vehicleLicensePlate),
    bankingInfo: !!(initialDriverData.bankAccountNumber && initialDriverData.bankRoutingNumber),
    licenseUploaded: initialDriverData.drivingLicenseStatus === 'UPLOADED' || initialDriverData.drivingLicenseStatus === 'VERIFIED',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Demo form submission:", formData);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update completion status based on formData for demo feedback
    setCompletionStatus({
        personalDetails: !!(formData.firstName && formData.lastName && formData.phoneNumber),
        vehicleInfo: !!(formData.vehicleMake && formData.vehicleLicensePlate),
        bankingInfo: !!(formData.bankAccountNumber && formData.bankRoutingNumber),
        licenseUploaded: formData.drivingLicenseStatus === 'UPLOADED' || formData.drivingLicenseStatus === 'VERIFIED',
    });

    setIsSubmitting(false);
    toast.success("Profile information (demo) updated! In a real app, this would be saved.");
  };

  const allSectionsComplete = Object.values(completionStatus).every(Boolean);

  return (
    <form onSubmit={handleDemoSubmit} className="space-y-8">
      {allSectionsComplete && (
        <div className="p-4 mb-6 bg-green-50 border border-green-300 rounded-md text-green-700 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Your driver profile is complete! You're all set.
        </div>
      )}
      {!allSectionsComplete && (
        <div className="p-4 mb-6 bg-yellow-50 border border-yellow-300 rounded-md text-yellow-700 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Please complete all sections to finalize your driver profile.
        </div>
      )}

      {/* Personal Details Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className='flex items-center'>
                <UserCircle className="h-6 w-6 mr-2 text-primary" />
                <CardTitle>Personal Details</CardTitle>
            </div>
            {completionStatus.personalDetails ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-yellow-500" />}
          </div>
          <CardDescription>Ensure your personal information is accurate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" required />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" required />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" value={formData.email} readOnly disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground mt-1">Email is not editable here. Change in main profile settings.</p>
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber || ''} onChange={handleChange} placeholder="+1 (555) 123-4567" required />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Vehicle Information Section */}
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div className='flex items-center'>
                    <Car className="h-6 w-6 mr-2 text-primary" />
                    <CardTitle>Vehicle Information</CardTitle>
                </div>
                {completionStatus.vehicleInfo ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-yellow-500" />}
            </div>
          <CardDescription>Provide details about the vehicle you will be using.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicleMake">Vehicle Make</Label>
              <Input id="vehicleMake" name="vehicleMake" value={formData.vehicleMake || ''} onChange={handleChange} placeholder="e.g., Toyota" />
            </div>
            <div>
              <Label htmlFor="vehicleModel">Vehicle Model</Label>
              <Input id="vehicleModel" name="vehicleModel" value={formData.vehicleModel || ''} onChange={handleChange} placeholder="e.g., Camry" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicleYear">Vehicle Year</Label>
              <Input id="vehicleYear" name="vehicleYear" type="number" value={formData.vehicleYear || ''} onChange={handleChange} placeholder="e.g., 2020" />
            </div>
            <div>
              <Label htmlFor="vehicleLicensePlate">License Plate</Label>
              <Input id="vehicleLicensePlate" name="vehicleLicensePlate" value={formData.vehicleLicensePlate || ''} onChange={handleChange} placeholder="e.g., ABC-123" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Banking Information Section */}
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div className='flex items-center'>
                    <Landmark className="h-6 w-6 mr-2 text-primary" />
                    <CardTitle>Banking Information</CardTitle>
                </div>
                 {completionStatus.bankingInfo ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-yellow-500" />}
            </div>
          <CardDescription>Securely provide your bank details for payouts. (Demo - Data not saved)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bankAccountName">Account Holder Name</Label>
            <Input id="bankAccountName" name="bankAccountName" value={formData.bankAccountName || ''} onChange={handleChange} placeholder="John M Doe" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankAccountNumber">Account Number</Label>
              <Input id="bankAccountNumber" name="bankAccountNumber" value={formData.bankAccountNumber || ''} onChange={handleChange} placeholder="Enter account number" />
            </div>
            <div>
              <Label htmlFor="bankRoutingNumber">Routing Number</Label>
              <Input id="bankRoutingNumber" name="bankRoutingNumber" value={formData.bankRoutingNumber || ''} onChange={handleChange} placeholder="Enter routing number" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Document Upload Section (Driving License) */}
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div className='flex items-center'>
                     <FileText className="h-6 w-6 mr-2 text-primary" />
                    <CardTitle>Driving License</CardTitle>
                </div>
                 {completionStatus.licenseUploaded ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-yellow-500" />}
            </div>
          <CardDescription>
            Upload a clear image of your valid driving license.
            Current status: <span className={`font-semibold ${formData.drivingLicenseStatus === 'VERIFIED' ? 'text-green-600' : formData.drivingLicenseStatus === 'PENDING' ? 'text-orange-600' : 'text-red-600'}`}>
                {formData.drivingLicenseStatus?.replace('_', ' ') || 'MISSING'}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formData.drivingLicenseStatus === 'UPLOADED' || formData.drivingLicenseStatus === 'VERIFIED' ? (
            <p className="text-green-600 flex items-center"><CheckCircle className="h-5 w-5 mr-2" /> License document is on file.</p>
          ) : (
            <p className="text-muted-foreground">
              Your driving license is required. Please upload it via the "Upload Documents" section.
            </p>
          )}
          <Button asChild variant="outline" className="mt-3">
            <Link href="/profile-settings/upload-documents"> {/* Adjust link if it's driver specific */}
              Go to Upload Documents <FileText className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>


      <CardFooter className="pt-6">
        <Button type="submit" disabled={isSubmitting} size="lg" className="w-full md:w-auto">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? 'Saving Demo Data...' : 'Save Demo Progress'}
        </Button>
      </CardFooter>
    </form>
  );
};

export default DriverCompleteAccountForm;