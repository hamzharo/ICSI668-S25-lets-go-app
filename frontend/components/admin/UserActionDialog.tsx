// frontend/components/admin/UserActionDialog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminUserView, UserRole } from '@/types'; // Assuming UserRole is 'PASSENGER' | 'DRIVER' | 'ADMIN'
import { Loader2, ShieldCheck, UserCog, UserX, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

export type UserActionType = 'CHANGE_ROLE' | 'SUSPEND_USER' | 'UNSUSPEND_USER';

interface UserActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUserView | null;
  actionType: UserActionType | null;
  onSubmit: (userId: string, actionType: UserActionType, data?: any) => Promise<void>; // Parent handles API call
  isProcessing: boolean;
}

const UserActionDialog = ({
  isOpen,
  onClose,
  user,
  actionType,
  onSubmit,
  isProcessing,
}: UserActionDialogProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  // Add state for other actions if needed, e.g., suspension reason (though usually not needed for suspend/unsuspend)

  useEffect(() => {
    if (isOpen && actionType === 'CHANGE_ROLE' && user) {
      setSelectedRole(user.role); // Pre-fill with current role
    } else if (!isOpen) {
      setSelectedRole(''); // Reset on close
    }
  }, [isOpen, actionType, user]);

  if (!user || !actionType) return null;

  const getDialogContent = () => {
    switch (actionType) {
      case 'CHANGE_ROLE':
        return {
          Icon: UserCog,
          title: `Change Role for ${user.firstName} ${user.lastName}`,
          description: `Select the new role for this user. This action can significantly alter user permissions.`,
          colorClass: 'text-indigo-500',
          confirmText: 'Update Role',
          fields: (
            <div className="grid gap-2 py-4">
              <Label htmlFor="newRole" className="font-semibold">New Role</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                <SelectTrigger id="newRole" className="w-full">
                  <SelectValue placeholder="Select new role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PASSENGER">Passenger</SelectItem>
                  <SelectItem value="DRIVER">Driver</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              {selectedRole === user.role && <p className="text-xs text-muted-foreground">This is the user's current role.</p>}
            </div>
          ),
        };
      case 'SUSPEND_USER':
        return {
          Icon: UserX,
          title: `Suspend User: ${user.firstName} ${user.lastName}`,
          description: `Are you sure you want to suspend this user's account? They will not be able to log in or use the service.`,
          colorClass: 'text-red-500',
          confirmText: 'Yes, Suspend User',
          fields: null,
        };
      case 'UNSUSPEND_USER':
        return {
          Icon: UserCheck,
          title: `Unsuspend User: ${user.firstName} ${user.lastName}`,
          description: `Are you sure you want to reactivate this user's account? They will regain access to the service.`,
          colorClass: 'text-green-500',
          confirmText: 'Yes, Unsuspend User',
          fields: null,
        };
      default:
        return { Icon: AlertTriangle, title: 'Confirm Action', description: '', colorClass: '', confirmText: 'Confirm', fields: null };
    }
  };

  const dialogContent = getDialogContent();

  const handleSubmit = () => {
    let data: any = {};
    if (actionType === 'CHANGE_ROLE') {
      if (!selectedRole || selectedRole === user.role) {
        toast.warn("Please select a new, different role.");
        return;
      }
      data = { newRole: selectedRole };
    }
    // For suspend/unsuspend, data might be a specific status string if backend needs it,
    // or the actionType itself might be enough for the backend endpoint.
    // Example: if backend expects { newAccountStatus: 'SUSPENDED' }
    if (actionType === 'SUSPEND_USER') data = { newAccountStatus: 'SUSPENDED' };
    if (actionType === 'UNSUSPEND_USER') data = { newAccountStatus: 'ACTIVE' };


    onSubmit(user.id, actionType, data);
  };


  return (
    <Dialog open={isOpen} onOpenChange={(openState) => !openState && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <dialogContent.Icon className={`mr-2 h-6 w-6 ${dialogContent.colorClass}`} />
            {dialogContent.title}
          </DialogTitle>
          <DialogDescription>{dialogContent.description}</DialogDescription>
        </DialogHeader>

        {dialogContent.fields}

        <DialogFooter className="sm:justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={actionType === 'SUSPEND_USER' ? "destructive" : "default"}
            className={actionType === 'UNSUSPEND_USER' ? "bg-green-600 hover:bg-green-700" : ""}
            onClick={handleSubmit}
            disabled={isProcessing || (actionType === 'CHANGE_ROLE' && (!selectedRole || selectedRole === user.role))}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {dialogContent.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserActionDialog;