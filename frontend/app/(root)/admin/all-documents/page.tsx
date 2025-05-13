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

// --- TODO: Replace with actual API service calls ---
interface PaginatedDocumentsResponse {
    content: AdminDocumentView[];
    totalPages: number;
    totalElements: number;
    currentPage: number; // 0-indexed typically from Spring Pageable
    size: number;
}

const fetchAllAdminDocumentsApi = async (
    filters: DocumentFilterValues,
    page: number, // 0-indexed for API
    size: number,
    token: string | null
): Promise<PaginatedDocumentsResponse> => {
  if (!token) throw new Error("Authentication required.");

  const queryParams = new URLSearchParams();
  if (filters.status && filters.status !== 'ALL') queryParams.append('status', filters.status);
  // if (filters.userIdOrEmail) queryParams.append('userSearch', filters.userIdOrEmail); // Backend needs to handle 'userSearch' by ID or email
  // if (filters.documentType !== 'ALL') queryParams.append('documentType', filters.documentType);
  // queryParams.append('page', page.toString());
  // queryParams.append('size', size.toString());
  // queryParams.append('sort', 'uploadDate,desc'); // Example sorting

  const url = `${API_BASE_URL}/api/documents/admin/all?${queryParams.toString()}`; // Endpoint from brief was /api/users/admin/all
  console.log(`API CALL: Fetching all admin documents with URL: ${url}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if(!response.ok) {
    let errorMessage = `Failed to fetch documents. Status: ${response.status} ${response.statusText}`;
    try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorResult.error || errorMessage;
    } catch (e) {
        errorMessage = (await response.text()) || errorMessage;
    }
    console.error("API Error fetching documents:", errorMessage, response);
    throw new Error(errorMessage);
  }

  const documentsArray: AdminDocumentView[] = await response.json();

  if (!Array.isArray(documentsArray)) {
    console.error("API Error: Expected an array of documents but received:", documentsArray);
    throw new Error("Received invalid data structure from API (expected array).");
  }
  console.log("API Success: Received document array (length):", documentsArray.length);

  const simulatedResponse: PaginatedDocumentsResponse = {
    content: documentsArray,        // All fetched documents are the content
    totalPages: 1,                  // Since everything is fetched, there's only 1 page
    totalElements: documentsArray.length, // Total is the length of the fetched array
    currentPage: 0,                 // We are effectively on page 0
    size: documentsArray.length,    // The size of this "page" is all elements
  };

  console.log("API Success: Simulated Paginated Response for Documents", simulatedResponse);
  return simulatedResponse;
};

// Reusing viewDocumentFile from DocumentReviewPage (or move to a shared util)
const viewDocumentFile = (documentId: string, fileName: string, token: string | null) => {
    if (!token) { toast.error("Authentication required."); return; }
    const fileUrl = `${API_BASE_URL}/api/documents/admin/${documentId}/file`; // Endpoint from brief was /api/users/admin/{documentId}/file
    // window.open(fileUrl, '_blank');
    // toast.info(`Attempting to open/download: ${fileName}`);
    fetch(fileUrl, { headers: { 'Authorization': `Bearer ${token}` }})
    .then(res => {
      if (!res.ok) {
        throw new Error(`Failed to download file: ${res.status} ${res.statusText}`);
      }
      return res.blob();
    })
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      // Try to set download attribute, otherwise open in new tab
      link.setAttribute('download', fileName || `document_${documentId}`); // Suggest filename
      link.target = '_blank'; // Fallback to opening in new tab
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl); // Clean up
      toast.info(`Opening/downloading: ${fileName}`);
    })
    .catch(err => {
      console.error("File view/download error:", err);
      toast.error(err.message || `Could not retrieve file ${fileName}`);
    });
};
// --- End TODO ---


export default function AllDocumentsAdminPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [documents, setDocuments] = useState<AdminDocumentView[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed for API
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 10; // Or make this configurable

  const [filters, setFilters] = useState<DocumentFilterValues>({
    status: 'ALL',
    userIdOrEmail: '',
    documentType: 'ALL',
  });

  const loadDocuments = useCallback(async (pageToLoad: number) => {
    if (!token || !user?.roles?.includes('ADMIN')) {
      if(!authLoading) setIsLoadingDocs(false);
      return;
    }
    setIsLoadingDocs(true);
    setError(null);
    try {
      const response = await fetchAllAdminDocumentsApi(filters, pageToLoad, itemsPerPage, token);
      setDocuments(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage); // Should match pageToLoad
      setTotalElements(response.totalElements);
    } catch (err: any) {
      console.error("Failed to load all documents for admin:", err);
      setError(err.message || "Could not load documents.");
      toast.error(err.message || "Failed to load documents.");
    } finally {
      setIsLoadingDocs(false);
    }
  }, [token, user, authLoading, filters]); // filters is a dependency now

  useEffect(() => {
    if (!authLoading && user?.roles?.includes('ADMIN')) {
      loadDocuments(currentPage); // Load current page when filters or user changes
    } else if (!authLoading && !user?.roles?.includes('ADMIN')) {
      toast.error("Access Denied to /all-documents. Administrator role required.");
      router.replace("/");
      setIsLoadingDocs(false);
    }
  }, [authLoading, user, filters, loadDocuments, router, currentPage]); // currentPage added

  const handleFilterChange = (newFilters: DocumentFilterValues) => {
    setCurrentPage(0); // Reset to first page when filters change
    setFilters(newFilters);
    // The useEffect will trigger loadDocuments due to 'filters' dependency change
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      // The useEffect will trigger loadDocuments due to 'currentPage' dependency change
    }
  };

  const handleViewFile = (documentId: string, fileName: string) => {
    viewDocumentFile(documentId, fileName, token);
  };


  if (authLoading || (!user && isLoadingDocs && documents.length === 0)) {
    return <div className="flex flex-grow items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!user || !user?.roles?.includes('ADMIN') ) {
    return (
        <div className="flex flex-col flex-grow items-center justify-center p-6 text-center">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-semibold text-destructive mb-2">Access Denied</h2>
            <p className="text-muted-foreground max-w-md">You do not have permission to view this page.</p>
        </div>
    );
  }

  if (error && !isLoadingDocs) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center p-6 text-center">
        <Frown className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Documents</h2>
        <p className="text-muted-foreground max-w-md mb-6">{error}</p>
        <Button onClick={() => loadDocuments(currentPage)} variant="outline">Try Again</Button>
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
          Browse, search, and filter all documents in the system.
        </p>
      </header>

      <DocumentFilters initialFilters={filters} onFilterChange={handleFilterChange} />

      <Separator className="my-4 md:my-6" />

      <AllDocumentsTable
        documents={documents}
        isLoading={isLoadingDocs}
        onViewFile={handleViewFile}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && !isLoadingDocs && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
              {/* Simple pagination display: Current page and total. Could be more complex. */}
              {[...Array(totalPages).keys()].map(pageNumber => (
                // Conditionally render page numbers or ellipsis for many pages
                (pageNumber === 0 || pageNumber === totalPages - 1 || Math.abs(pageNumber - currentPage) <= 1 || (currentPage <=2 && pageNumber <=3) || (currentPage >= totalPages -3 && pageNumber >= totalPages -4) ) ? (
                    <PaginationItem key={pageNumber}>
                    <PaginationLink
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePageChange(pageNumber); }}
                        isActive={currentPage === pageNumber}
                    >
                        {pageNumber + 1}
                    </PaginationLink>
                    </PaginationItem>
                ) : ( (Math.abs(pageNumber - currentPage) === 2 && totalPages > 5 && !((currentPage <=2 && pageNumber <=3) || (currentPage >= totalPages -3 && pageNumber >= totalPages -4))) || (pageNumber === 1 && currentPage > 3 && totalPages > 5) || (pageNumber === totalPages -2 && currentPage < totalPages-4 && totalPages > 5)  )  ? ( // Show ellipsis
                    <PaginationItem key={`ellipsis-${pageNumber}`}>
                        <PaginationEllipsis />
                    </PaginationItem>
                ) : null
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                  className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
       {!isLoadingDocs && documents.length > 0 && <p className="text-center text-sm text-muted-foreground mt-2">Showing {documents.length} of {totalElements} documents.</p>}

    </div>
  );
}