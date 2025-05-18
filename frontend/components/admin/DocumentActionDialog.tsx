// frontend/components/admin/DocumentActionDialog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose, // If you want a manual close button
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminDocumentView, DocumentStatusUpdatePayload } from '@/types'; // Or use DocumentMetadata
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface DocumentActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: AdminDocumentView | null; // The document being actioned upon
  actionType: 'VERIFY' | 'REJECT';
  onSubmit: (payload: DocumentStatusUpdatePayload) => Promise<void>; // Parent handles API call
  isProcessing: boolean;
}

const DocumentActionDialog = ({
  isOpen,
  onClose,
  document,
  actionType,
  onSubmit,
  isProcessing,
}: DocumentActionDialogProps) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset reason when dialog opens or document changes
    if (isOpen) {
      setRejectionReason('');
      setError('');
    }
  }, [isOpen, document]);

  const handleSubmit = async () => {
    if (actionType === 'REJECT' && !rejectionReason.trim()) {
      setError('Rejection reason is required.');
      return;
    }
    setError('');

    const payload: DocumentStatusUpdatePayload = {
      newStatus: actionType === 'VERIFY' ? 'APPROVED' : 'REJECTED',
      ...(actionType === 'REJECT' && { rejectionReason: rejectionReason.trim() }),
    };
    await onSubmit(payload); // Parent will close dialog on success if needed
  };

  if (!document) return null;

  const title = actionType === 'VERIFY' ? 'Confirm Document Verification' : 'Confirm Document Rejection';
  const description = actionType === 'VERIFY'
    ? `Are you sure you want to mark document "${document.fileName}" (for ${document.userFirstName} ${document.userLastName}) as VERIFIED?`
    : `Please provide a reason for rejecting document "${document.fileName}" (for ${document.userFirstName} ${document.userLastName}).`;

  return (
    <Dialog open={isOpen} onOpenChange={(openState) => !openState && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {actionType === 'VERIFY' ? <CheckCircle className="mr-2 h-6 w-6 text-green-500" /> : <XCircle className="mr-2 h-6 w-6 text-red-500" />}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {actionType === 'REJECT' && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-center gap-2">
              <Label htmlFor="rejectionReason" className="text-left font-semibold">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (e.target.value.trim()) setError('');
                }}
                placeholder="E.g., Document is blurry, expired, or incorrect type."
                className="col-span-3 min-h-[100px]"
                disabled={isProcessing}
              />
              {error && <p className="text-sm text-red-600 col-span-4">{error}</p>}
            </div>
          </div>
        )}

        {actionType === 'VERIFY' && (
            <p className="py-4 text-sm text-muted-foreground">
                Ensure the document meets all verification criteria before proceeding. This action cannot be easily undone.
            </p>
        )}


        <DialogFooter className="sm:justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={actionType === 'VERIFY' ? "default" : "destructive"}
            className={actionType === 'VERIFY' ? "bg-green-600 hover:bg-green-700" : ""}
            onClick={handleSubmit}
            disabled={isProcessing || (actionType === 'REJECT' && !rejectionReason.trim())}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {actionType === 'VERIFY' ? 'Confirm Verification' : 'Confirm Rejection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentActionDialog;