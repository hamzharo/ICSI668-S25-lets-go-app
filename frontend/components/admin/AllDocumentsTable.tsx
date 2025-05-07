// frontend/components/admin/AllDocumentsTable.tsx
'use client';

import React from 'react';
import { AdminDocumentView } from '@/types'; // Reusing AdminDocumentView
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { Eye, Download, MoreHorizontal, UserCircle, FileText, CalendarIcon, AlertTriangle, CheckCircle, ClockIcon, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AllDocumentsTableProps {
  documents: AdminDocumentView[];
  isLoading: boolean;
  onViewFile: (documentId: string, fileName: string) => void;
  // No direct approve/reject actions here, those are on DocumentReviewTable or a details view
  // onRowClick?: (document: AdminDocumentView) => void; // Optional: for navigating to a full document details page
}

// Reusing status styling functions from DocumentReviewTable (or move to a shared util)
const getStatusBadgeVariant = (status: AdminDocumentView['status']): "default" | "destructive" | "secondary" | "outline" | "success" => {
    switch (status) {
      case 'VERIFIED': return "success";
      case 'REJECTED': return "destructive";
      case 'PENDING_VERIFICATION': return "secondary";
      default: return "outline";
    }
};

const getStatusIcon = (status: AdminDocumentView['status']) => {
    switch (status) {
      case 'VERIFIED': return <CheckCircle className="h-4 w-4 mr-1.5 text-green-600" />;
      case 'REJECTED': return <AlertTriangle className="h-4 w-4 mr-1.5 text-red-600" />;
      case 'PENDING_VERIFICATION': return <ClockIcon className="h-4 w-4 mr-1.5 text-yellow-600" />;
      default: return <Info className="h-4 w-4 mr-1.5 text-gray-500"/>;
    }
}

const AllDocumentsTable = ({ documents, isLoading, onViewFile }: AllDocumentsTableProps) => {

  const renderSkeletons = (count: number) => {
    return Array(count).fill(0).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton className="h-5 w-40 rounded" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32 rounded" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24 rounded" /></TableCell>
        <TableCell><Skeleton className="h-5 w-28 rounded" /></TableCell>
        <TableCell><Skeleton className="h-5 w-20 rounded" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded" /></TableCell>
      </TableRow>
    ));
  };

  if (isLoading && documents.length === 0) {
    return (
      <div className="rounded-md border dark:border-gray-700">
        <Table>
            <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                    <TableHead className="px-4 py-3">User (ID/Email)</TableHead>
                    <TableHead className="px-4 py-3">Document Type</TableHead>
                    <TableHead className="px-4 py-3">File Name</TableHead>
                    <TableHead className="px-4 py-3">Uploaded On</TableHead>
                    <TableHead className="px-4 py-3">Status</TableHead>
                    <TableHead className="text-right px-4 py-3">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {renderSkeletons(10)} {/* Show more skeletons for a potentially larger table */}
            </TableBody>
        </Table>
      </div>
    );
  }


  if (!isLoading && documents.length === 0) {
    return (
      <Table>
        <TableCaption>No documents found matching your criteria.</TableCaption>
      </Table>
    );
  }

  return (
    <div className="rounded-md border dark:border-gray-700">
      <Table>
        <TableCaption className="py-4">List of all user-submitted documents.</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/30">
            <TableHead className="w-[280px] px-4 py-3">User</TableHead>
            <TableHead className="px-4 py-3">Document Type</TableHead>
            <TableHead className="px-4 py-3">File Name</TableHead>
            <TableHead className="px-4 py-3">Uploaded On</TableHead>
            <TableHead className="w-[180px] px-4 py-3">Status</TableHead>
            <TableHead className="text-right w-[100px] px-4 py-3">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
              <TableCell className="font-medium px-4 py-3">
                <div className="flex items-center">
                  <UserCircle className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
                  <div>
                    {doc.userFirstName} {doc.userLastName}
                    <span className="block text-xs text-muted-foreground truncate" title={doc.userEmail}>{doc.userEmail}</span>
                    <span className="block text-xs text-muted-foreground">User ID: {doc.userId}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3">
                <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1.5 text-muted-foreground flex-shrink-0"/>
                    {doc.documentType.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 truncate max-w-xs" title={doc.fileName}>{doc.fileName}</TableCell>
              <TableCell className="px-4 py-3">
                  <div className="flex items-center text-xs text-muted-foreground">
                      <CalendarIcon className="h-4 w-4 mr-1.5 flex-shrink-0"/>
                      {format(new Date(doc.uploadDate), "dd MMM yyyy, HH:mm")}
                  </div>
              </TableCell>
              <TableCell className="px-4 py-3">
                <Badge variant={getStatusBadgeVariant(doc.status)} className="capitalize text-xs px-2.5 py-1">
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
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewFile(doc.id, doc.fileName)}>
                      <Download className="mr-2 h-4 w-4" /> View/Download File
                    </DropdownMenuItem>
                    {/* Add other actions if needed, e.g., link to user profile, view document details modal */}
                    {/* <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" /> View User Profile
                    </DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* TODO: Add Pagination controls here */}
    </div>
  );
};

export default AllDocumentsTable;