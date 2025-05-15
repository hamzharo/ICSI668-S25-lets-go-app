// frontend/app/(root)/profile-settings/upload-documents/components/DocumentListTable.tsx
'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DocumentMetadata, DOCUMENT_TYPES } from '@/types'; // Assuming types are in @/types
import { Trash2, Eye, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'; // Icons
import { format } from 'date-fns'; // For date formatting: npm install date-fns

interface DocumentListTableProps {
  documents: DocumentMetadata[];
  onDelete: (documentId: string) => Promise<void>;
  // onPreview?: (document: DocumentMetadata) => void; // Optional preview functionality
  isLoading: boolean;
}

const getDocumentTypeLabel = (value: string) => {
    return DOCUMENT_TYPES.find(dt => dt.value === value)?.label || value;
};

export const DocumentListTable = ({ documents, onDelete, isLoading }: DocumentListTableProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">Loading documents...</p>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Table>
        <TableCaption>No documents uploaded yet.</TableCaption>
      </Table>
    );
  }

  const getStatusBadgeVariant = (status: DocumentMetadata['status']): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'VERIFIED':
        return "default"; // Greenish, or use a custom class for success
      case 'REJECTED':
        return "destructive"; // Red
      case 'PENDING_VERIFICATION':
        return "secondary"; // Yellowish/Orangeish
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: DocumentMetadata['status']) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />;
      case 'REJECTED':
        return <AlertTriangle className="h-4 w-4 mr-1 text-red-600" />;
      case 'PENDING_VERIFICATION':
        return <Clock className="h-4 w-4 mr-1 text-yellow-600" />;
      default:
        return null;
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">File Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium truncate max-w-xs">{doc.fileName}</TableCell>
              <TableCell>{getDocumentTypeLabel(doc.documentType)}</TableCell>
              <TableCell>{format(new Date(doc.uploadDate), "dd MMM yyyy, HH:mm")}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(doc.status)} className="capitalize flex items-center">
                  {getStatusIcon(doc.status)}
                  {doc.status.replace('_', ' ').toLowerCase()}
                </Badge>
                {doc.status === 'REJECTED' && doc.rejectionReason && (
                  <p className="text-xs text-destructive mt-1">Reason: {doc.rejectionReason}</p>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                {doc.fileUrl && (
                    <Button variant="outline" size="icon" asChild>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" title="View Document">
                            <Eye className="h-4 w-4" />
                        </a>
                    </Button>
                )}
                {/* Allow deleting PENDING or REJECTED documents. VERIFIED might be non-deletable by user. */}
                {(doc.status === 'PENDING_VERIFICATION' || doc.status === 'REJECTED') && (
                  <Button variant="ghost" size="icon" onClick={() => onDelete(doc.id)} title="Delete Document">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};