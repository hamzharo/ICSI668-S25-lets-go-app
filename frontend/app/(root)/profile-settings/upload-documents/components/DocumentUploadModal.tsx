// frontend/app/(root)/profile-settings/upload-documents/components/DocumentUploadModal.tsx
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DOCUMENT_TYPES, DocumentTypeValue } from '@/types'; // Import document types
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];

const uploadFormSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  file: z
    .any()
    .refine((files) => files?.length === 1, "File is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png, .webp and .pdf files are accepted."
    ),
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void; // Callback to refresh document list
  token: string; // Auth token for API call
}

export const DocumentUploadModal = ({ isOpen, onClose, onUploadSuccess, token }: DocumentUploadModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      documentType: '',
      file: undefined,
    },
  });

  const onSubmit = async (data: UploadFormValues) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('documentType', data.documentType);
    formData.append('file', data.file[0]);

    console.log("Uploading document:", data.documentType, data.file[0].name);

    // --- TODO: Implement actual API call POST /api/users/me/documents ---
    try {
    //   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/documents`, {
    //     method: 'POST',
    //     headers: {
    //       // 'Content-Type': 'multipart/form-data' is set automatically by browser with FormData
    //       'Authorization': `Bearer ${token}`,
    //     },
    //     body: formData,
    //   });
    //   const result = await response.json();
    //   if (!response.ok) {
    //     throw new Error(result.message || "Failed to upload document.");
    //   }
    //   toast.success("Document uploaded successfully!");
    //   onUploadSuccess(); // Refresh the list in the parent component
    //   form.reset();
    //   onClose(); // Close the modal

    // Mock success:
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Mock: ${data.documentType} uploaded successfully!`);
      onUploadSuccess();
      form.reset();
      onClose();

    } catch (error: any) {
      toast.error(error.message || "An error occurred while uploading document.");
    } finally {
      setIsLoading(false);
    }
    // --- End TODO ---
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload New Document</DialogTitle>
          <DialogDescription>
            Select the type of document and choose the file to upload. Max file size: 5MB.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((docType) => (
                        <SelectItem key={docType.value} value={docType.value}>
                          {docType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...restField } }) => ( // Destructure field to handle file input
                <FormItem>
                  <FormLabel>Document File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept={ACCEPTED_IMAGE_TYPES.join(",")}
                      onChange={(event) => {
                        onChange(event.target.files);
                      }}
                      {...restField}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Uploading..." : "Upload Document"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};