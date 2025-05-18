// frontend/components/admin/UserFilters.tsx
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserFilterValues } from '@/types';
import { X, Search } from 'lucide-react';

interface UserFiltersProps {
  initialFilters: UserFilterValues;
  onFilterChange: (filters: UserFilterValues) => void;
}

const UserFilters = ({ initialFilters, onFilterChange }: UserFiltersProps) => {
  const [filters, setFilters] = React.useState<UserFilterValues>(initialFilters);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  const handleSelectChange = (name: keyof Pick<UserFilterValues, 'role' | 'status'>, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value as any }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters: UserFilterValues = { role: 'ALL', status: 'ALL', searchTerm: '' };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  // Define more specific status options for clarity
  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active Account' },
    { value: 'SUSPENDED', label: 'Suspended Account' },
    { value: 'PENDING_EMAIL_VERIFICATION', label: 'Pending Email Verification' },
    { value: 'DRIVER_PENDING', label: 'Driver (Pending Docs/Approval)' }, // Combines PENDING_VERIFICATION for drivers
    { value: 'DRIVER_APPROVED', label: 'Driver (Approved)' },
    { value: 'DRIVER_REJECTED', label: 'Driver (Docs Rejected)' },
  ];


  return (
    <form onSubmit={handleSubmit} className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/30 shadow">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <Label htmlFor="searchTerm" className="text-sm font-medium">Search User</Label>
          <Input
            id="searchTerm"
            name="searchTerm"
            placeholder="Name, Email, or User ID"
            value={filters.searchTerm}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="role" className="text-sm font-medium">Role</Label>
          <Select name="role" value={filters.role} onValueChange={(value) => handleSelectChange('role', value)}>
            <SelectTrigger id="role"><SelectValue placeholder="Filter by role..." /></SelectTrigger>
            <SelectContent className='bg-white'>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="PASSENGER">Passenger</SelectItem>
              <SelectItem value="DRIVER">Driver</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status" className="text-sm font-medium">Status</Label>
          <Select name="status" value={filters.status} onValueChange={(value) => handleSelectChange('status', value)}>
            <SelectTrigger id="status"><SelectValue placeholder="Filter by status..." /></SelectTrigger>
            <SelectContent className='bg-white'>
              {statusOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
            <Search className="mr-2 h-4 w-4" /> Apply
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} className="w-full sm:w-auto">
            <X className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
      </div>
    </form>
  );
};

export default UserFilters;