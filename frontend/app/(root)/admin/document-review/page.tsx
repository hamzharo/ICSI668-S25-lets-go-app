// frontend/app/(root)/admin/document-review/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { AdminDocumentView, DocumentStatus, DocumentStatusUpdatePayload } from '@/types';
import DocumentReviewTable from '@/components/admin/DocumentReviewTable';
import { toast } from 'react-toastify';
import { Loader2, Users, Frown, Filter, FileCheck2, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// --- TODO: Replace with actual API service calls ---
const fetchAdminDocumentsApi = async (filterStatus: DocumentStatus | 'ALL', token: string | null): Promise<AdminDocumentView[]> => {
  if (!token) throw new Error("Authentication required.");
  let url = `${API_BASE_URL}/api/admin/documents/all`; // Endpoint from brief was /api/users/admin/all
  if (filterStatus !== 'ALL') {
    url += `?status=${filterStatus}`;
  }
  console.log(`API CALL: Fetching admin documents with URL: ${url}`);
  // const response = await fetch(url, {
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // if (!response.ok) {
  //   const errorResult = await response.json().catch(() => ({ message: "Failed to fetch documents." }));
  //   throw new Error(errorResult.message);
  // }
  // return response.json();

  // Mock API response:
  return new Promise(resolve => setTimeout(() => {
    const allDocs: AdminDocumentView[] = [
      { id: 'doc_admin_1', userId: 'user1', userFirstName: 'Alice', userLastName: 'Smith', userEmail: 'alice@example.com', documentType: 'DRIVING_LICENSE', fileName: 'alice_license.pdf', uploadDate: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'PENDING_VERIFICATION' },
      { id: 'doc_admin_2', userId: 'user2', userFirstName: 'Bob', userLastName: 'Johnson', userEmail: 'bob@example.com', documentType: 'VEHICLE_REGISTRATION', fileName: 'bob_reg.jpg', uploadDate: new Date(Date.now() - 86400000 * 1).toISOString(), status: 'PENDING_VERIFICATION' },
      { id: 'doc_admin_3', userId: 'user3', userFirstName: 'Carol', userLastName: 'Williams', userEmail: 'carol@example.com', documentType: 'DRIVING_LICENSE', fileName: 'carol_license.png', uploadDate: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'VERIFIED' },
      { id: 'doc_admin_4', userId: 'user4', userFirstName: 'David', userLastName: 'Brown', userEmail: 'dave@example.com', documentType: 'INSURANCE_POLICY', fileName: 'david_insurance.pdf', uploadDate: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'REJECTED', rejectionReason: 'Document expired' },
    ];
    if (filterStatus === 'ALL') resolve(allDocs);
    else resolve(allDocs.filter(doc => doc.status === filterStatus));
  }, 1000));
};

const updateDocumentStatusApi = async (documentId: string, payload: DocumentStatusUpdatePayload, token: string | null): Promise<AdminDocumentView> => { // Expect updated document
  if (!token) throw new Error("Authentication required.");
  console.log(`API CALL: Updating document ${documentId} status to ${payload.newStatus}`);
  const queryParams = new URLSearchParams({ newStatus: payload.newStatus });
  if (payload.rejectionReason) {
    queryParams.append('rejectionReason', payload.rejectionReason);
  }
  // const response = await fetch(`${API_BASE_URL}/api/admin/documents/${documentId}/status?${queryParams.toString()}`, { // Endpoint from brief was /api/users/admin/{documentId}/status
  //   method: 'PUT',
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // if (!response.ok) {
  //   const errorResult = await response.json().catch(() => ({ message: "Failed to update document status." }));
  //   throw new Error(errorResult.message);
  // }
  // return response.json();

  // Mock API response:
  return new Promise(resolve => setTimeout(() => {
    // This should ideally return the updated document object from the backend
    resolve({ id: documentId, status: payload.newStatus } as AdminDocumentView); // Simplified mock
  }, 800));
};

// Function to trigger file download/view (handled by opening a new tab to the backend URL)
const viewDocumentFile = (documentId: string, fileName: string, token: string | null) => {
    if (!token) {
        toast.error("Authentication required to view file.");
        return;
    }
    // Endpoint from brief was /api/users/admin/{documentId}/file
    const fileUrl = `${API_BASE_URL}/api/admin/documents/${documentId}/file?token=${token}`; // Pass token if backend needs it for direct access
    // Or, if backend uses cookie auth and is on same domain, token might not be needed in URL
    // Forcing download with a specific name:
    // const link = document.createElement('a');
    // link.href = fileUrl;
    // link.setAttribute('download', fileName); // Or let the browser decide based on Content-Disposition
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    window.open(fileUrl, '_blank'); // Simpler: opens in new tab, browser handles download/display
    toast.info(`Attempting to open/download: ${fileName}`);
};
// --- End TODO ---


const DocumentStatusOptions: Array<{ value: DocumentStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PENDING_VERIFICATION', label: 'Pending Verification' },
    { value: 'VERIFIED', label: 'Verified' },
    { value: 'REJECTED', label: 'Rejected' },
];


export default function DocumentReviewPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [documents, setDocuments] = useState<AdminDocumentView[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'ALL'>('PENDING_VERIFICATION'); // Default filter

  const loadDocuments = useCallback(async (filter: DocumentStatus | 'ALL') => {
    if (!token || user?.role !== 'ADMIN') {
      if (!authLoading) setIsLoadingDocs(false);
      return;
    }
    setIsLoadingDocs(true);
    setError(null);
    try {
      const fetchedDocs = await fetchAdminDocumentsApi(filter, token);
      setDocuments(fetchedDocs);
    } catch (err: any) {
      console.error("Failed to load documents for admin review:", err);
      setError(err.message || "Could not load documents.");
      toast.error(err.message || "Failed to load documents.");
    } finally {
      setIsLoadingDocs(false);
    }
  }, [token, user, authLoading]);

  useEffect(() => {
    if (!authLoading && user?.role === 'ADMIN') {
      loadDocuments(statusFilter);
    } else if (!authLoading && user?.role !== 'ADMIN') {
      toast.error("Access Denied. Administrator role required.");
      router.replace("/"); // Redirect non-admins
      setIsLoadingDocs(false);
    }
  }, [authLoading, user, statusFilter, loadDocuments, router]);

  const handleUpdateStatus = async (documentId: string, payload: DocumentStatusUpdatePayload) => {
    // API call is handled by this page, callback from table/dialog informs what to do
    await updateDocumentStatusApi(documentId, payload, token); // Actual API call
    // Refresh the list to show updated status
    loadDocuments(statusFilter);
  };

  const handleViewFile = (documentId: string, fileName: string) => {
    viewDocumentFile(documentId, fileName, token);
  };

  if (authLoading || (!user && isLoadingDocs)) {
    return <div className="flex flex-grow items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!user || user.role !== 'ADMIN') {
     // Fallback display if redirect hasn't occurred
    return (
        <div className="flex flex-col flex-grow items-center justify-center p-6 text-center">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-semibold text-destructive mb-2">Access Denied</h2>
            <p className="text-muted-foreground max-w-md">You do not have permission to view this page.</p>
        </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center p-6 text-center">
        <Frown className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Documents</h2>
        <p className="text-muted-foreground max-w-md mb-6">{error}</p>
        <Button onClick={() => loadDocuments(statusFilter)} variant="outline">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow p-4 md:p-6 lg:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white flex items-center">
            <FileCheck2 className="mr-3 h-8 w-8 text-orange-500" /> Document Verification
            </h1>
            <p className="text-lg text-muted-foreground dark:text-gray-400 mt-1">
            Review and manage user-submitted documents.
            </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-center">
            <Filter className="h-5 w-5 text-muted-foreground"/>
            <Select
                value={statusFilter}
                onValueChange={(value: DocumentStatus | 'ALL') => setStatusFilter(value)}
            >
                <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Filter by status..." />
                </SelectTrigger>
                <SelectContent>
                    {DocumentStatusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </header>

      <Separator />

      <DocumentReviewTable
        documents={documents}
        isLoading={isLoadingDocs}
        onUpdateStatus={handleUpdateStatus}
        onViewFile={handleViewFile}
      />
    </div>
  );
}