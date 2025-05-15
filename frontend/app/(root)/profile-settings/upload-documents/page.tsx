// frontend/app/(root)/profile-settings/upload-documents/page.tsx
'use client';

import { Separator } from "@/components/ui/separator";
import { DocumentListTable } from "@/components/documents/DocumentListTable";
import { DocumentUploadModal } from "@/components/documents/DocumentUploadModal";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck2, AlertCircle, Info, UploadCloud, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { DocumentMetadata, DOCUMENT_TYPES } from '@/types';

// --- TODO: Replace with actual API service calls ---
const fetchUserDocumentsApi = async (token: string): Promise<DocumentMetadata[]> => {
    console.log("API CALL: Fetching documents for user with token:", token);
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/documents`, {
    //     headers: { 'Authorization': `Bearer ${token}` }
    // });
    // if (!response.ok) {
    //     const errorResult = await response.json().catch(() => ({ message: "Failed to fetch documents" }));
    //     throw new Error(errorResult.message);
    // }
    // return response.json();
    return new Promise(resolve => setTimeout(() => resolve([
        { id: 'doc1_mock', fileName: 'license_front.pdf', documentType: 'DRIVING_LICENSE', status: 'VERIFIED', uploadDate: new Date(Date.now() - 86400000 * 2).toISOString(), fileUrl: '#' },
        { id: 'doc2_mock', fileName: 'vehicle_reg.jpg', documentType: 'VEHICLE_REGISTRATION', status: 'PENDING_VERIFICATION', uploadDate: new Date(Date.now() - 86400000).toISOString(), fileUrl: '#' },
        { id: 'doc3_mock', fileName: 'old_insurance.png', documentType: 'INSURANCE_POLICY', status: 'REJECTED', rejectionReason: 'Document is expired. Please upload a current policy.', uploadDate: new Date(Date.now() - 86400000 * 5).toISOString() },
    ]), 1000));
};

const deleteDocumentApi = async (documentId: string, token: string): Promise<void> => {
    console.log(`API CALL: Deleting document ${documentId} with token ${token}`);
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/documents/${documentId}`, {
    //     method: 'DELETE',
    //     headers: { 'Authorization': `Bearer ${token}` }
    // });
    // if (!response.ok) {
    //     const errorResult = await response.json().catch(() => ({ message: "Failed to delete document" }));
    //     throw new Error(errorResult.message);
    // }
    return new Promise(resolve => setTimeout(resolve, 500));
};
// --- End TODO ---


export default function UploadDocumentsPage() {
    const { user, token, isLoading: authLoading } = useAuth();
    const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const refreshDocuments = useCallback(async () => {
        if (!token || user?.roles !== 'DRIVER') {
            setIsLoadingDocs(false);
            return;
        }
        setIsLoadingDocs(true);
        try {
            const fetchedDocs = await fetchUserDocumentsApi(token);
            setDocuments(fetchedDocs);
        } catch (err: any) {
            console.error("Failed to load documents:", err);
            toast.error(err.message || "Failed to load documents.");
            setDocuments([]); // Clear documents on error
        } finally {
            setIsLoadingDocs(false);
        }
    }, [token, user?.roles]);

    useEffect(() => {
        if (!authLoading) { // Only run if auth context is no longer loading
          refreshDocuments();
        }
    }, [authLoading, refreshDocuments]);


    const handleDeleteDocument = async (documentId: string) => {
        if (!token) {
            toast.error("Authentication error. Please log in again.");
            return;
        }
        const confirmed = window.confirm("Are you sure you want to delete this document? This action cannot be undone.");
        if (confirmed) {
            try {
                await deleteDocumentApi(documentId, token);
                toast.success("Document deleted successfully.");
                refreshDocuments(); // Refresh the list
            } catch (error: any) {
                toast.error(error.message || "Failed to delete document.");
                console.error(error);
            }
        }
    };

    if (authLoading) {
        return <div className="flex justify-center items-center h-60"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    }

    if (user?.roles !== 'DRIVER') {
        return (
            <div className="space-y-6 p-6 md:p-10 max-w-3xl mx-auto">
                 <Alert variant="default" className="mt-10">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>
                        Document upload and management is applicable for Driver accounts only.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const driverProfileStatus = user?.driverStatus; // From AuthContext's user object

    return (
        <div className="space-y-8 p-4 md:p-8 lg:p-10 pb-16 max-w-5xl mx-auto"> {/* Max width and centering */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Manage Documents</h2>
                    <p className="text-muted-foreground text-md">
                        Upload and manage required documents for your driver profile verification.
                    </p>
                </div>
                <Button onClick={() => setIsUploadModalOpen(true)} size="lg">
                    <UploadCloud className="mr-2 h-5 w-5" /> Upload New Document
                </Button>
            </div>
            <Separator className="my-8" />

            {/* Driver Profile Status Alert */}
            {driverProfileStatus === 'APPROVED' && (
                <Alert className="bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
                    <FileCheck2 className="h-5 w-5" />
                    <AlertTitle className="font-semibold">Profile Approved!</AlertTitle>
                    <AlertDescription>
                        Congratulations! All your documents are verified, and your driver profile is active and ready to go.
                    </AlertDescription>
                </Alert>
            )}
            {driverProfileStatus === 'PENDING_VERIFICATION' && (
                <Alert className="bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300">
                    <Info className="h-5 w-5" />
                    <AlertTitle className="font-semibold">Documents Under Review</AlertTitle>
                    <AlertDescription>
                        Your uploaded documents are currently being verified by our team. This process usually takes 1-2 business days. We'll notify you of any updates.
                    </AlertDescription>
                </Alert>
            )}
             {driverProfileStatus === 'REJECTED' && (
                <Alert variant="destructive">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="font-semibold">Action Required: Profile Rejected</AlertTitle>
                    <AlertDescription>
                        There was an issue with your document verification. Please review the statuses of individual documents below, make necessary corrections, and re-upload. Contact support if you need assistance.
                    </AlertDescription>
                </Alert>
            )}
            {(!driverProfileStatus || (driverProfileStatus !== 'APPROVED' && driverProfileStatus !== 'PENDING_VERIFICATION' && driverProfileStatus !== 'REJECTED')) && documents.length === 0 && !isLoadingDocs &&(
                 <Alert className="bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
                    <Info className="h-5 w-5" />
                    <AlertTitle className="font-semibold">Get Started with Document Upload</AlertTitle>
                    <AlertDescription>
                        To activate your driver profile, please upload the required documents. Refer to the list below for guidance.
                    </AlertDescription>
                </Alert>
            )}


            <DocumentListTable
                documents={documents}
                onDelete={handleDeleteDocument}
                isLoading={isLoadingDocs}
            />

            {token && ( // Only render modal if token is available
                 <DocumentUploadModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    onUploadSuccess={refreshDocuments}
                    token={token}
                />
            )}

            <Card className="mt-10">
                <CardHeader>
                    <CardTitle className="text-xl">Required Documents Guide</CardTitle>
                    <CardDescription>Ensure all uploaded documents are clear, legible, valid, and not expired. All sides of a document may be required.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                        {DOCUMENT_TYPES.map(dt => (
                            <li key={dt.value}>{dt.label}</li>
                        ))}
                        {/* Example:
                        <li>Valid Driving License (Front and Back images/PDF)</li>
                        <li>Vehicle Registration Certificate (Clear copy)</li>
                        <li>Proof of Vehicle Insurance (Active policy document)</li>
                        <li>National ID or Passport (For identity verification)</li>
                        */}
                    </ul>
                    <p className="text-xs mt-4 italic">Specific document requirements may vary. Contact support for any clarifications.</p>
                </CardContent>
            </Card>
        </div>
    );
}