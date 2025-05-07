// frontend/app/(root)/profile-settings/complete-account/page.tsx
'use client';

import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Loader2, Mail, FileText, ExternalLink, UserCheck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

// --- TODO: API call for resending verification email (if needed) ---
// const resendVerificationEmailApi = async (token: string): Promise<void> => {
//     console.log("API CALL: Resending verification email with token:", token);
//     // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-verification`, {
//     //     method: 'POST',
//     //     headers: { 'Authorization': `Bearer ${token}` }
//     // });
//     // if (!response.ok) {
//     //     const errorResult = await response.json().catch(() => ({ message: "Failed to resend email" }));
//     //     throw new Error(errorResult.message);
//     // }
//     await new Promise(resolve => setTimeout(resolve, 1000)); // Mock
// };
// --- End TODO ---

interface CompletionStep {
  id: string;
  label: string;
  isCompleted: boolean;
  details: string;
  actionLabel?: string;
  actionLink?: string;
  onActionClick?: () => void;
  icon: React.ElementType;
  isCritical?: boolean; // If this step blocks full functionality
}

export default function CompleteAccountPage() {
  const { user, isLoading: authLoading, token } = useAuth();
  const [completionSteps, setCompletionSteps] = useState<CompletionStep[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null); // For loading state on individual actions

  useEffect(() => {
    if (user) {
      const steps: CompletionStep[] = [];

      // Step 1: Email Verification (Common for all roles, potentially)
      // You need a flag like `user.isEmailVerified` from your AuthContext/backend
      const isEmailVerified = user.emailVerified || false; // Assuming 'emailVerified' field in user object
      steps.push({
        id: 'email-verification',
        label: "Verify Your Email Address",
        isCompleted: isEmailVerified,
        details: isEmailVerified
          ? `Your email (${user.emailId}) is verified.`
          : `A verification link was sent to ${user.emailId}. Please check your inbox (and spam folder).`,
        actionLabel: !isEmailVerified ? "Resend Verification Email" : undefined,
        onActionClick: !isEmailVerified ? async () => {
          if (!token) { toast.error("Auth error"); return; }
          setIsActionLoading('email-verification');
          try {
            // await resendVerificationEmailApi(token); // TODO: Uncomment and implement
            await new Promise(resolve => setTimeout(resolve, 1500)); // Mock
            toast.success("Verification email resent. Please check your inbox.");
          } catch (err: any) {
            toast.error(err.message || "Failed to resend email.");
          } finally {
            setIsActionLoading(null);
          }
        } : undefined,
        icon: Mail,
        isCritical: !isEmailVerified,
      });

      // Step 2: Profile Information (Common, less critical as basic info is at signup)
      // Assuming basic profile is always "complete" after signup, but could be more detailed
      steps.push({
        id: 'profile-info',
        label: "Complete Your Profile Information",
        isCompleted: !!(user.firstName && user.lastName), // Basic check
        details: "Ensure your first name, last name, and other personal details are up-to-date.",
        actionLabel: "Edit Profile",
        actionLink: "/profile-settings/edit-profile",
        icon: UserCheck,
      });


      if (user.role === 'DRIVER') {
        // Step 3: Document Upload & Verification (DRIVER specific)
        const documentsApproved = user.driverStatus === 'APPROVED';
        steps.push({
          id: 'driver-documents',
          label: "Upload & Verify Driver Documents",
          isCompleted: documentsApproved,
          details: documentsApproved
            ? "All required driver documents have been uploaded and approved."
            : user.driverStatus === 'PENDING_VERIFICATION'
            ? "Your documents are uploaded and pending review."
            : user.driverStatus === 'REJECTED'
            ? "Some documents were rejected. Please review and re-upload."
            : "Please upload your driving license, vehicle registration, etc.",
          actionLabel: "Manage Documents",
          actionLink: "/profile-settings/upload-documents",
          icon: FileText,
          isCritical: !documentsApproved,
        });

        // Add more DRIVER specific steps (e.g., vehicle details, bank details for payouts) if applicable
      }

      // Calculate overall progress
      const completedCount = steps.filter(step => step.isCompleted).length;
      setOverallProgress(steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 100);
      setCompletionSteps(steps);
    }
  }, [user, token]); // Add token to dependency array if onActionClick uses it

  if (authLoading) {
    return <div className="flex justify-center items-center h-60"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return (
      <div className="space-y-6 p-6 md:p-10 max-w-3xl mx-auto">
        <Alert variant="destructive" className="mt-10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You must be logged in to view this page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const allCriticalStepsCompleted = completionSteps
    .filter(step => step.isCritical)
    .every(step => step.isCompleted);

  return (
    <div className="space-y-8 p-4 md:p-8 lg:p-10 pb-16 max-w-3xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Account Setup Checklist</h2>
        <p className="text-muted-foreground text-md">
          Complete these steps to fully activate your account and enjoy all features.
        </p>
      </div>
      <Separator className="my-8" />

      {completionSteps.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-semibold text-primary">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="w-full h-3" />
        </div>
      )}

      {overallProgress === 100 && completionSteps.length > 0 && (
         <Alert className="bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300 mb-8">
            <CheckCircle className="h-5 w-5" />
            <AlertTitle className="font-semibold">All Set! Your Account is Fully Active.</AlertTitle>
            <AlertDescription>
              You've completed all necessary steps. Explore the app and enjoy your journey!
            </AlertDescription>
        </Alert>
      )}

      {overallProgress < 100 && !allCriticalStepsCompleted && user.role === 'DRIVER' && (
        <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-semibold">Action Required to Activate Driver Features</AlertTitle>
            <AlertDescription>
              Please complete all critical steps (marked with an asterisk or similar) to fully use driver functionalities.
            </AlertDescription>
        </Alert>
      )}


      <div className="space-y-6">
        {completionSteps.map(step => (
          <Card key={step.id} className={step.isCompleted ? "border-green-300 dark:border-green-700" : step.isCritical ? "border-destructive dark:border-destructive" : ""}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center">
                  <step.icon className={`h-6 w-6 mr-3 ${step.isCompleted ? 'text-green-500' : 'text-muted-foreground'}`} />
                  {step.label}
                </CardTitle>
                <CardDescription>{step.details}</CardDescription>
              </div>
              {step.isCompleted ? (
                <CheckCircle className="h-7 w-7 text-green-500" />
              ) : (
                <AlertCircle className={`h-7 w-7 ${step.isCritical ? 'text-destructive' : 'text-yellow-500'}`} />
              )}
            </CardHeader>
            {!step.isCompleted && (step.actionLink || step.onActionClick) && (
              <CardFooter className="pt-4 border-t">
                {step.actionLink && (
                  <Link href={step.actionLink} passHref legacyBehavior>
                    <Button variant="default" asChild>
                        <a>{step.actionLabel || "Proceed"} <ExternalLink className="ml-2 h-4 w-4"/></a>
                    </Button>
                  </Link>
                )}
                {step.onActionClick && (
                  <Button
                    variant="default"
                    onClick={step.onActionClick}
                    disabled={isActionLoading === step.id}
                  >
                    {isActionLoading === step.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {step.actionLabel || "Perform Action"}
                  </Button>
                )}
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      {completionSteps.length === 0 && !authLoading && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>No Pending Steps</AlertTitle>
            <AlertDescription>
              It looks like your account is all set up!
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}