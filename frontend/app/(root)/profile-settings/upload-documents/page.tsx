// frontend/app/(root)/driver/profile-settings/upload-documents/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DocumentListTable } from '@/components/documents/DocumentListTable'; // Correct path
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal'; // Correct path
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { DocumentMetadata, FeDocumentStatus } from '@/types'; // Import your types
import { toast } from 'react-toastify';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const UploadDocumentsPage = () => {
  const { user, token, isLoading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // For delete operation

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchDocuments = useCallback(async () => {
    if (!token) return;
    setIsLoadingDocs(true);
    try {
      const response = await fetch(`${API_URL}/api/documents/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch documents');
      }
      const data: DocumentMetadata[] = await response.json();
      // Map backend fields to frontend table fields if necessary
      const formattedData = data.map(doc => ({
        ...doc,
        // DocumentListTable expects fileName and uploadDate
        fileName: doc.originalFilename,
        uploadDate: doc.uploadedAt,
        // Potentially construct fileUrl if backend gives filePath
        // fileUrl: doc.filePath ? `${API_URL}/api/documents/me/file/${doc.id}` : undefined // Example
      }));
      setDocuments(formattedData);
    } catch (error: any) {
      toast.error(error.message || 'Could not load documents.');
      setDocuments([]); // Clear documents on error
    } finally {
      setIsLoadingDocs(false);
    }
  }, [token, API_URL]);

  useEffect(() => {
    if (token) {
      fetchDocuments();
    }
  }, [token, fetchDocuments]);

  const handleUploadSuccess = () => {
    fetchDocuments(); // Refresh the list
    // Potentially refresh user context if driverStatus might have changed
    // refreshUser(); // If you have such a function in useAuth
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!token) {
      toast.error("Authentication token not found.");
      return;
    }
    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
        return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/documents/me/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        // Try to parse error message from backend if available
        let errorMsg = 'Failed to delete document.';
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch (e) { /* Keep default errorMsg */ }
        throw new Error(errorMsg);
      }
      toast.success('Document deleted successfully!');
      fetchDocuments(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading && !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
     // This should ideally be handled by a layout or higher-order component
    return <p className="text-center mt-10">Please log in to manage documents.</p>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Your Documents</h1>
          <p className="text-muted-foreground">
            Upload and manage documents required for your driver profile.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="lg">
          <PlusCircle className="mr-2 h-5 w-5" /> Upload New Document
        </Button>
      </header>

      <Card>
        <CardHeader>
            <CardTitle>My Uploaded Documents</CardTitle>
            <CardDescription>
                Review the status of your submitted documents. You can delete documents that are pending or rejected.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <DocumentListTable
                documents={documents}
                onDelete={handleDeleteDocument}
                isLoading={isLoadingDocs || isSubmitting}
            />
        </CardContent>
      </Card>

      {token && (
        <DocumentUploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          token={token}
        />
      )}
    </div>
  );
};

export default UploadDocumentsPage;