// frontend/components/admin/DocumentFilters.tsx
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DocumentStatus, DOCUMENT_TYPES } from '@/types'; // Assuming DOCUMENT_TYPES is an array of { value: string, label: string }
import { X, Search } from 'lucide-react';

export interface DocumentFilterValues {
  status: DocumentStatus | 'ALL';
  userIdOrEmail: string; // Search by user ID or email
  documentType: string | 'ALL'; // Could be from DOCUMENT_TYPES or 'ALL'
}

interface DocumentFiltersProps {
  initialFilters: DocumentFilterValues;
  onFilterChange: (filters: DocumentFilterValues) => void;
  // onResetFilters: () => void; // Optional reset functionality
}

const DocumentFilters = ({ initialFilters, onFilterChange }: DocumentFiltersProps) => {
  const [filters, setFilters] = React.useState<DocumentFilterValues>(initialFilters);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof DocumentFilterValues, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value as any }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters = { status: 'ALL', userIdOrEmail: '', documentType: 'ALL' } as DocumentFilterValues;
    setFilters(resetFilters);
    onFilterChange(resetFilters); // Apply reset filters immediately
  };


  return (
    <form onSubmit={handleSubmit} className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/30 shadow">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <Label htmlFor="status" className="text-sm font-medium">Status</Label>
          <Select
            name="status"
            value={filters.status}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Filter by status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING_VERIFICATION">Pending Verification</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="userIdOrEmail" className="text-sm font-medium">User ID or Email</Label>
          <Input
            id="userIdOrEmail"
            name="userIdOrEmail"
            placeholder="Enter User ID or Email"
            value={filters.userIdOrEmail}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="documentType" className="text-sm font-medium">Document Type</Label>
          <Select
            name="documentType"
            value={filters.documentType}
            onValueChange={(value) => handleSelectChange('documentType', value)}
          >
            <SelectTrigger id="documentType">
              <SelectValue placeholder="Filter by type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {DOCUMENT_TYPES.map(dt => (
                <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
            <Search className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} className="w-full sm:w-auto">
            <X className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
      </div>
    </form>
  );
};

export default DocumentFilters;