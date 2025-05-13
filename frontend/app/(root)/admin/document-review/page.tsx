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
const fetchAdminDocumentsApi = async (filterStatus: DocumentStatus | 'ALL', token: string | null): 
Promise<AdminDocumentView[]> => {
  if (!token) throw new Error("Authentication required.");
  let url = `${API_BASE_URL}/api/documents/admin/all`;
  const queryParams = new URLSearchParams();

  if (filterStatus !== 'ALL') {
    queryParams.append('status', filterStatus);
  }

  const queryString = queryParams.toString();
  if(queryString){
    url += `?${queryString}`
  }

  console.log(`API CALL: Fetching admin documents with URL: ${url}`);

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    let errorMessage = `Failed to fetch documents. Status: ${response.status} ${response.statusText}`;
    let errorBodyText = '';
    try {
        errorBodyText = await response.text();
        const errorResult = JSON.parse(errorBodyText);
        errorMessage = errorResult.message || errorResult.error || errorMessage;
    } catch (e) {
        if (errorBodyText) {
            errorMessage = `${errorMessage} - Response: ${errorBodyText.substring(0, 200)}`;
        }
        console.warn("Response body was not valid JSON or read failed.", e);
    }
    console.error("API Error fetching documents:", errorMessage, response);
    throw new Error(errorMessage);
  }

  const documentsArray: AdminDocumentView[] = await response.json();

  if (!Array.isArray(documentsArray)) {
    console.error("API Error: Expected an array of documents but received:", documentsArray);
    throw new Error("Received invalid data structure from API (expected array).");
  }

  console.log(`API Success: Received ${documentsArray.length} documents.`);
  return documentsArray;
};

const updateDocumentStatusApi = async (documentId: string, payload: DocumentStatusUpdatePayload, token: string | null): Promise<AdminDocumentView> => { // Expect updated document
  if (!token) throw new Error("Authentication required.");

  console.log(`API CALL: Updating document ${documentId} status to ${payload.newStatus}, Reason: ${payload.rejectionReason}`);

  // --- FIX: Construct URL and Query Params correctly ---
  // Backend Controller base: /api/documents, Endpoint: /admin/{documentId}/status
  const url = `${API_BASE_URL}/api/documents/admin/${documentId}/status`;
  const queryParams = new URLSearchParams({ newStatus: payload.newStatus });
  if (payload.rejectionReason) {
    queryParams.append('rejectionReason', payload.rejectionReason);
  }

  // --- FIX: Make the actual fetch call ---
  const response = await fetch(`${url}?${queryParams.toString()}`, {
    method: 'PUT', // Method is PUT
    headers: {
        'Authorization': `Bearer ${token}`,
        // Content-Type might not be needed for PUT with query params, but can be added if required by backend
        // 'Content-Type': 'application/json' // Only if sending a JSON body
    }
    // No body needed as data is in query params per backend code
  });

  // --- FIX: Improved error handling ---
   if (!response.ok) {
    let errorMessage = `Failed to update document status. Status: ${response.status} ${response.statusText}`;
    let errorBodyText = '';
    try {
        errorBodyText = await response.text();
        const errorResult = JSON.parse(errorBodyText);
        errorMessage = errorResult.message || errorResult.error || errorMessage;
    } catch (e) {
        if (errorBodyText) {
            errorMessage = `${errorMessage} - Response: ${errorBodyText.substring(0, 200)}`;
        }
         console.warn("Response body was not valid JSON or read failed.", e);
    }
    console.error("API Error updating document status:", errorMessage, response);
    throw new Error(errorMessage);
  }

  // --- FIX: Parse and return the updated document ---
  const updatedDocument: AdminDocumentView = await response.json();
  console.log(`API Success: Document ${documentId} status updated.`);
  return updatedDocument;
};

// Function to trigger file download/view
const viewDocumentFile = (documentId: string, fileName: string, token: string | null) => {
  if (!token) {
      toast.error("Authentication required to view file.");
      return;
  }
  // --- FIX: Ensure URL is correct ---
  // Backend Controller base: /api/documents, Endpoint: /admin/{documentId}/file
  const fileUrl = `${API_BASE_URL}/api/documents/admin/${documentId}/file`;

  // --- FIX: Use the fetch/blob method ---
  fetch(fileUrl, { headers: { 'Authorization': `Bearer ${token}` }})
    .then(res => {
      if (!res.ok) {
         // Try to get error message from headers or fallback
         const errorMsg = res.headers.get('X-Error-Message') || `Failed to download file: ${res.status} ${res.statusText}`;
        throw new Error(errorMsg);
      }
      // Check content type if needed, otherwise assume blob is okay
      // const contentType = res.headers.get('content-type');
      return res.blob();
    })
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', fileName || `document_${documentId}`);
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl); // Clean up memory
      toast.info(`Opening/downloading: ${fileName}`);
    })
    .catch(err => {
      console.error("File view/download error:", err);
      toast.error(err.message || `Could not retrieve file ${fileName}`);
    });
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
    if (!token || !user?.roles?.includes('ADMIN')) {
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
    if (!authLoading && user?.roles?.includes('ADMIN')) {
      loadDocuments(statusFilter);
    } else if (!authLoading && !user?.roles?.includes('ADMIN')) {
      toast.error("Access Denied to /document-review. Administrator role required.");
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

  if (!user || !user.roles.includes('ADMIN')) {
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