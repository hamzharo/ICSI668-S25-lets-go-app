// frontend/app/(root)/admin/all-documents/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { AdminDocumentView, DocumentStatus } from '@/types';
import AllDocumentsTable from '@/components/admin/AllDocumentsTable';
import DocumentFilters, { DocumentFilterValues } from '@/components/admin/DocumentFilters';
import { toast } from 'react-toastify';
import { Loader2, Files, Frown, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"; // ShadCN Pagination

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface PaginatedDocumentsResponse {
    content: AdminDocumentView[];
    totalPages: number;
    totalElements: number;
    currentPage: number; // 0-indexed typically from Spring Pageable
    size: number;
}

const fetchAllAdminDocumentsApi = async (
  // Only status filter is supported by the current backend for /admin/all
  statusFilter: DocumentStatus | 'ALL',
  token: string | null
): Promise<AdminDocumentView[]> => { // Expects an array directly
  if (!token) throw new Error("Authentication required.");

  const queryParams = new URLSearchParams();
  if (statusFilter && statusFilter !== 'ALL') {
    queryParams.append('status', statusFilter);
  }

  // The backend endpoint is /api/documents/admin/all
  let url = `${API_BASE_URL}/api/documents/admin/all`;
  const queryString = queryParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  console.log(`API CALL: Fetching all admin documents with URL: ${url}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if(!response.ok) {
    let errorMessage = `Failed to fetch documents. Status: ${response.status} ${response.statusText}`;
    let errorBodyText = '';
    try {
        errorBodyText = await response.text();
        const errorResult = JSON.parse(errorBodyText);
        errorMessage = errorResult.message || errorResult.error || errorMessage;
    } catch (e) {
        if (errorBodyText) {
            errorMessage = `${errorMessage} - Response: ${errorBodyText.substring(0,300)}`;
        }
        console.warn("Response body was not valid JSON or read failed.", e);
    }
    console.error("API Error fetching documents:", errorMessage, response);
    throw new Error(errorMessage);
  }

  // Expects an array directly from the backend
  const documentsArray: AdminDocumentView[] = await response.json();

  if (!Array.isArray(documentsArray)) {
    console.error("API Error: Expected an array of documents but received:", documentsArray);
    throw new Error("Received invalid data structure from API (expected array).");
  }

  console.log("API Success: Received document array (length):", documentsArray.length);
  return documentsArray;
};

const viewDocumentFile = (documentId: string, downloadFileName: string, token: string | null) => { // Renamed for clarity
    if (!token) { toast.error("Authentication required."); return; }
    const fileUrl = `${API_BASE_URL}/api/documents/admin/${documentId}/file`;

    fetch(fileUrl, { headers: { 'Authorization': `Bearer ${token}` }})
    .then(res => {
      if (!res.ok) {
        // Try to get error message from headers or fallback
         const errorMsgFromHeader = res.headers.get('X-Error-Message'); // If backend sets custom error header
         if (errorMsgFromHeader) throw new Error(errorMsgFromHeader);

        // Try to parse error from body if it's JSON
        return res.text().then(text => {
            try {
                const errorJson = JSON.parse(text);
                throw new Error(errorJson.message || errorJson.error || `Failed to download file: ${res.status} ${res.statusText}`);
            } catch (e) {
                 // If not JSON, or parsing failed, use the text or generic message
                throw new Error(text || `Failed to download file: ${res.status} ${res.statusText}`);
            }
        });
      }
      return res.blob();
    })
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      // Use the provided downloadFileName (which is originalFilename)
      link.setAttribute('download', downloadFileName || `document_${documentId}`);
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.info(`Opening/downloading: ${downloadFileName}`);
    })
    .catch(err => {
      console.error("File view/download error:", err);
      toast.error(err.message || `Could not retrieve file ${downloadFileName}`);
    });
};


export default function AllDocumentsAdminPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [allFetchedDocuments, setAllFetchedDocuments] = useState<AdminDocumentView[]>([]); // Store all docs
  const [displayedDocuments, setDisplayedDocuments] = useState<AdminDocumentView[]>([]); // For client-side filtering/searching if implemented
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state - only 'status' will be used for API call.
  // 'userIdOrEmail' and 'documentType' can be used for client-side filtering if desired.
  const [filters, setFilters] = useState<DocumentFilterValues>({
    status: 'ALL', // This is used for the API call
    userIdOrEmail: '', // For potential client-side filtering
    documentType: 'ALL', // For potential client-side filtering
  });

  const loadDocuments = useCallback(async () => {
    if (!token || !user?.roles?.includes('ADMIN')) {
      if (!authLoading) setIsLoadingDocs(false);
      return;
    }
    setIsLoadingDocs(true);
    setError(null);
    try {
      // Only pass the status filter to the API
      const fetchedDocs = await fetchAllAdminDocumentsApi(filters.status, token);
      setAllFetchedDocuments(fetchedDocs);
      // Initially, displayed documents are all fetched documents (before client-side filtering)
      // setDisplayedDocuments(fetchedDocs); // We'll apply client-side filters below
    } catch (err: any) {
      console.error("Failed to load all documents for admin:", err);
      setError(err.message || "Could not load documents.");
      toast.error(err.message || "Failed to load documents.");
      setAllFetchedDocuments([]); // Clear on error
      // setDisplayedDocuments([]);
    } finally {
      setIsLoadingDocs(false);
    }
  }, [token, user, authLoading, filters.status]); // Only filters.status affects API call

  // Effect to load documents when component mounts or auth/status filter changes
  useEffect(() => {
    if (!authLoading) {
      if (user?.roles?.includes('ADMIN') && token) {
        loadDocuments();
      } else {
        toast.error("Access Denied. Administrator role required or session invalid.");
        router.replace("/");
        setIsLoadingDocs(false);
      }
    }
  }, [authLoading, user, token, loadDocuments, router]);


  // Effect for client-side filtering based on userIdOrEmail and documentType
  useEffect(() => {
    let filtered = [...allFetchedDocuments];

    if (filters.userIdOrEmail) {
      const searchTerm = filters.userIdOrEmail.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.userId.toLowerCase().includes(searchTerm) ||
        doc.userEmail.toLowerCase().includes(searchTerm) ||
        doc.userFirstName?.toLowerCase().includes(searchTerm) ||
        doc.userLastName?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.documentType && filters.documentType !== 'ALL') {
      filtered = filtered.filter(doc => doc.documentType === filters.documentType);
    }
    // Note: The 'status' filter is already applied by the API call.
    // If you want to further filter by status client-side from an 'ALL' API fetch,
    // you'd fetch with status='ALL' and then filter here.
    // But since /admin/all already takes a status, this client-side status filter isn't needed
    // if filters.status is passed to the API.

    setDisplayedDocuments(filtered);
  }, [allFetchedDocuments, filters.userIdOrEmail, filters.documentType]);


  const handleFilterChange = (newFilters: DocumentFilterValues) => {
    // The API call will re-trigger via loadDocuments if newFilters.status changes (due to useEffect dependency)
    // Other filter changes (userIdOrEmail, documentType) will trigger client-side filtering via the second useEffect
    setFilters(newFilters);
  };

  const handleViewFile = (documentId: string, fileName: string) => {
    viewDocumentFile(documentId, fileName, token);
  };

  // --- Loading, Access Denied, Error States (similar to before) ---
  if (authLoading || (isLoadingDocs && displayedDocuments.length === 0 && allFetchedDocuments.length === 0)) {
    return <div className="flex flex-grow items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!user || !user?.roles?.includes('ADMIN') ) {
    // ... access denied JSX ...
     return (
        <div className="flex flex-col flex-grow items-center justify-center p-6 text-center">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-semibold text-destructive mb-2">Access Denied</h2>
            <p className="text-muted-foreground max-w-md">You do not have permission to view this page.</p>
        </div>
    );
  }

  if (error && !isLoadingDocs) {
    // ... error JSX ...
    return (
      <div className="flex flex-col flex-grow items-center justify-center p-6 text-center">
        <Frown className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Documents</h2>
        <p className="text-muted-foreground max-w-md mb-6">{error}</p>
        <Button onClick={loadDocuments} variant="outline">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow p-4 md:p-6 lg:p-8 space-y-6">
      <header className="mb-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white flex items-center">
          <Files className="mr-3 h-8 w-8 text-blue-500" /> All Submitted Documents
        </h1>
        <p className="text-lg text-muted-foreground dark:text-gray-400 mt-1">
          Browse and filter all documents in the system.
        </p>
      </header>

      {/* DocumentFilters component can still exist, but only its 'status' field will affect the API call.
          Other fields will be used for client-side filtering. */}
      <DocumentFilters initialFilters={filters} onFilterChange={handleFilterChange} />

      <Separator className="my-4 md:my-6" />

      {/* Pass displayedDocuments (client-side filtered) to the table */}
      <AllDocumentsTable
        documents={displayedDocuments}
        isLoading={isLoadingDocs}
        onViewFile={handleViewFile}
      />

      {/* Remove Pagination Controls as backend doesn't support it */}
      {!isLoadingDocs && displayedDocuments.length > 0 && (
        <p className="text-center text-sm text-muted-foreground mt-2">
          Showing {displayedDocuments.length} document(s) matching criteria.
        </p>
      )}
      {!isLoadingDocs && allFetchedDocuments.length > 0 && displayedDocuments.length === 0 && filters.userIdOrEmail && (
         <p className="text-center text-sm text-muted-foreground mt-2">
          No documents found matching all filter criteria. Fetched {allFetchedDocuments.length} based on status filter.
        </p>
      )}
       {!isLoadingDocs && allFetchedDocuments.length === 0 && (
         <p className="text-center text-sm text-muted-foreground mt-2">
          No documents found.
        </p>
      )}
    </div>
  );
}