// frontend/components/admin/DocumentReviewTable.tsx
'use client';

import React, { useState } from 'react';
import { AdminDocumentView, DocumentStatusUpdatePayload } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DocumentActionDialog from './DocumentActionDialog'; // Import the dialog
import { format } from 'date-fns';
import { Eye, CheckCircle, XCircle, MoreHorizontal, Download, UserCircle, FileText, CalendarIcon, AlertTriangle, ClockIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { Info } from 'lucide-react';

interface DocumentReviewTableProps {
  documents: AdminDocumentView[];
  isLoading: boolean;
  onUpdateStatus: (documentId: string, payload: DocumentStatusUpdatePayload) => Promise<void>;
  onViewFile: (documentId: string, fileName: string) => void; // Parent handles file download/view logic
}

const getStatusBadgeVariant = (status: AdminDocumentView['status']): "default" | "destructive" | "secondary" | "outline" | "success" => {
    switch (status) {
      case 'APPROVED':
        return "success";
      case 'REJECTED':
        return "destructive";
      case 'PENDING_APPROVAL':
        return "secondary";
      default:
        return "outline";
    }
};

const getStatusIcon = (status: AdminDocumentView['status']) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 mr-1.5 text-green-600" />;
      case 'REJECTED':
        return <AlertTriangle className="h-4 w-4 mr-1.5 text-red-600" />;
      case 'PENDING_APPROVAL':
        return <ClockIcon className="h-4 w-4 mr-1.5 text-yellow-600" />;
      default:
        return null;
    }
}

const DocumentReviewTable = ({ documents, isLoading, onUpdateStatus, onViewFile }: DocumentReviewTableProps) => {
  const [selectedDocument, setSelectedDocument] = useState<AdminDocumentView | null>(null);
  const [actionType, setActionType] = useState<'VERIFY' | 'REJECT' | null>(null);
  const [isActionDialogProcessing, setIsActionDialogProcessing] = useState(false);

  const openActionDialog = (doc: AdminDocumentView, type: 'VERIFY' | 'REJECT') => {
    setSelectedDocument(doc);
    setActionType(type);
  };

  const closeActionDialog = () => {
    setSelectedDocument(null);
    setActionType(null);
  };

  const handleDialogSubmit = async (payload: DocumentStatusUpdatePayload) => {
    if (!selectedDocument) return;
    setIsActionDialogProcessing(true);
    try {
      await onUpdateStatus(selectedDocument.id, payload);
      toast.success(`Document status updated to ${payload.newStatus.toLowerCase()}!`);
      closeActionDialog();
    } catch (error: any) {
      toast.error(error.message || "Failed to update document status.");
      // Keep dialog open on error for user to retry or see message, or close it:
      // closeActionDialog();
    } finally {
      setIsActionDialogProcessing(false);
    }
  };

  if (isLoading && documents.length === 0) { // Show loader only if no documents are displayed yet
    return (
      <div className="text-center py-10">
        {/* <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" /> */}
        <p className="mt-2 text-muted-foreground">Loading documents...</p>
      </div>
    );
  }

  if (!isLoading && documents.length === 0) {
    return (
      <Table>
        <TableCaption>No documents found matching the current filters.</TableCaption>
      </Table>
    );
  }

  return (
    <>
      <div className="rounded-md border dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800/50">
              <TableHead className="w-[250px] px-4 py-3">User</TableHead>
              <TableHead className="px-4 py-3">Document Type</TableHead>
              <TableHead className="px-4 py-3">File Name</TableHead>
              <TableHead className="px-4 py-3">Uploaded On</TableHead>
              <TableHead className="w-[180px] px-4 py-3">Status</TableHead>
              <TableHead className="text-right w-[150px] px-4 py-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                <TableCell className="font-medium px-4 py-3">
                  <div className="flex items-center">
                    <UserCircle className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                        {doc.userId}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                    <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1.5 text-muted-foreground"/>
                        {doc.documentType.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                    </div>
                </TableCell>
                <TableCell className="px-4 py-3 truncate max-w-xs">{doc.originalFilename}</TableCell>
                <TableCell className="px-4 py-3">
                    <div className="flex items-center text-xs text-muted-foreground">
                        <CalendarIcon className="h-4 w-4 mr-1.5"/>
                        {/* {format(new Date(doc.uploadDate), "dd MMM yyyy, HH:mm")} */}
                        {doc.uploadedAt}
                    </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge variant={getStatusBadgeVariant(doc.status)} className="capitalize text-xs px-2 py-0.5">
                    {getStatusIcon(doc.status)}
                    {doc.status.replace('_', ' ').toLowerCase()}
                  </Badge>
                  {doc.status === 'REJECTED' && doc.rejectionReason && (
                    <p className="text-xs text-destructive mt-1 truncate" title={doc.rejectionReason}>Reason: {doc.rejectionReason}</p>
                  )}
                </TableCell>
                <TableCell className="text-right px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onViewFile(doc.id, doc.originalFilename)}>
                        <Download className="mr-2 h-4 w-4" /> View/Download File
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {doc.status === 'PENDING_APPROVAL' && (
                        <>
                          <DropdownMenuItem onClick={() => openActionDialog(doc, 'VERIFY')} className="text-green-600 focus:bg-green-50 focus:text-green-700 dark:focus:bg-green-700/20 dark:focus:text-green-400">
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openActionDialog(doc, 'REJECT')} className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-700/20 dark:focus:text-red-400">
                            <XCircle className="mr-2 h-4 w-4" /> Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      {doc.status !== 'PENDING_APPROVAL' && (
                        <DropdownMenuItem disabled>
                            <Info className="mr-2 h-4 w-4"/> No pending actions
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedDocument && actionType && (
        <DocumentActionDialog
          isOpen={!!(selectedDocument && actionType)}
          onClose={closeActionDialog}
          document={selectedDocument}
          actionType={actionType}
          onSubmit={handleDialogSubmit}
          isProcessing={isActionDialogProcessing}
        />
      )}
    </>
  );
};

export default DocumentReviewTable;