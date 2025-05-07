// frontend/components/admin/UserTable.tsx
'use client';

import React, { useState } from 'react'; // Added useState
import { AdminUserView } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { MoreHorizontal, UserCog, ShieldCheck, UserCheck, UserX, Edit2, Trash2, ShieldQuestion, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import UserActionDialog, { UserActionType } from './UserActionDialog'; // Import the dialog

interface UserTableProps {
  users: AdminUserView[];
  isLoading: boolean;
  onUserAction: (userId: string, actionType: UserActionType, data?: any) => Promise<void>; // Updated callback
  isActionProcessing: (userId: string, actionType: UserActionType) => boolean; // To check if a specific action for a user is loading
}

// ... (Keep getRoleBadgeVariant and getStatusDisplay functions as before) ...
const getRoleBadgeVariant = (role: AdminUserView['role']): "default" | "secondary" | "outline" => { /* ... */ return "outline" };
const getStatusDisplay = (user: AdminUserView): { text: string; Icon: React.ElementType; colorClass: string; } => { /* ... */ return { text: "", Icon: UserCog, colorClass: ""} };


const UserTable = ({ users, isLoading, onUserAction, isActionProcessing }: UserTableProps) => {
  const [selectedUserForAction, setSelectedUserForAction] = useState<AdminUserView | null>(null);
  const [currentActionType, setCurrentActionType] = useState<UserActionType | null>(null);

  const openUserActionDialog = (user: AdminUserView, actionType: UserActionType) => {
    setSelectedUserForAction(user);
    setCurrentActionType(actionType);
  };

  const closeUserActionDialog = () => {
    setSelectedUserForAction(null);
    setCurrentActionType(null);
  };

  // ... (renderSkeletons function as before) ...
  const renderSkeletons = (count: number) => Array(count).fill(0).map((_, index) => ( <TableRow key={`skeleton-user-${index}`}> <TableCell><Skeleton className="h-5 w-40 rounded" /></TableCell> <TableCell><Skeleton className="h-5 w-24 rounded" /></TableCell> <TableCell><Skeleton className="h-5 w-20 rounded" /></TableCell> <TableCell><Skeleton className="h-5 w-28 rounded" /></TableCell> <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded" /></TableCell> </TableRow> ));


  if (isLoading && users.length === 0) { /* ... Skeleton Table ... */ return ( <div className="rounded-md border dark:border-gray-700"> <Table> <TableHeader> <TableRow className="bg-gray-50 dark:bg-gray-800/50"> <TableHead className="px-4 py-3">User</TableHead> <TableHead className="px-4 py-3">Role</TableHead> <TableHead className="px-4 py-3">Status</TableHead> <TableHead className="px-4 py-3">Joined</TableHead> <TableHead className="text-right px-4 py-3">Actions</TableHead> </TableRow> </TableHeader> <TableBody>{renderSkeletons(10)}</TableBody> </Table> </div> ); }
  if (!isLoading && users.length === 0) { /* ... No Users Found ... */ return <Table><TableCaption>No users found matching your criteria.</TableCaption></Table>; }

  return (
    <>
      <div className="rounded-md border dark:border-gray-700">
        <Table>
          <TableCaption className="py-4">List of all registered users.</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/30">
              <TableHead className="w-[300px] px-4 py-3">User</TableHead>
              <TableHead className="w-[120px] px-4 py-3">Role</TableHead>
              <TableHead className="w-[200px] px-4 py-3">Status</TableHead>
              <TableHead className="px-4 py-3">Joined Date</TableHead>
              <TableHead className="text-right w-[100px] px-4 py-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const { text: statusText, Icon: StatusIcon, colorClass: statusColorClass } = getStatusDisplay(user);
              const processingChangeRole = isActionProcessing(user.id, 'CHANGE_ROLE');
              const processingSuspend = isActionProcessing(user.id, 'SUSPEND_USER');
              const processingUnsuspend = isActionProcessing(user.id, 'UNSUSPEND_USER');
              const anyProcessing = processingChangeRole || processingSuspend || processingUnsuspend;

              return (
                <TableRow key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                  <TableCell className="font-medium px-4 py-3">
                    {/* ... User display ... */}
                    <div> {user.firstName} {user.lastName} <span className="block text-xs text-muted-foreground truncate" title={user.emailId}>{user.emailId}</span> <span className="block text-xs text-muted-foreground">ID: {user.id}</span> </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize text-xs">
                      {user.role.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className={`flex items-center text-xs font-medium ${statusColorClass}`}>
                      <StatusIcon className="mr-1.5 h-4 w-4" />
                      {statusText}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                    {format(new Date(user.createdAt), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-right px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={anyProcessing}>
                          {anyProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openUserActionDialog(user, 'CHANGE_ROLE')}>
                          <UserCog className="mr-2 h-4 w-4" /> Change Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.accountStatus === 'ACTIVE' && (
                          <DropdownMenuItem onClick={() => openUserActionDialog(user, 'SUSPEND_USER')} className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:text-red-400 dark:focus:bg-red-900/30">
                            <UserX className="mr-2 h-4 w-4" /> Suspend User
                          </DropdownMenuItem>
                        )}
                        {user.accountStatus === 'SUSPENDED' && (
                           <DropdownMenuItem onClick={() => openUserActionDialog(user, 'UNSUSPEND_USER')} className="text-green-600 focus:bg-green-50 focus:text-green-700 dark:focus:text-green-400 dark:focus:bg-green-900/30">
                            <UserCheck className="mr-2 h-4 w-4" /> Unsuspend User
                          </DropdownMenuItem>
                        )}
                        {/* Optional: Link to a full user detail/edit page */}
                        {/* <DropdownMenuSeparator />
                        <Link href={`/admin/users/${user.id}`} passHref legacyBehavior>
                            <DropdownMenuItem>
                                <Edit2 className="mr-2 h-4 w-4" /> View/Edit Full Details
                            </DropdownMenuItem>
                        </Link> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedUserForAction && currentActionType && (
        <UserActionDialog
            isOpen={!!(selectedUserForAction && currentActionType)}
            onClose={closeUserActionDialog}
            user={selectedUserForAction}
            actionType={currentActionType}
            onSubmit={async (userId, actionType, data) => { // onSubmit for dialog
                await onUserAction(userId, actionType, data); // Call parent's handler
                closeUserActionDialog(); // Close dialog on success (parent handles errors via toast)
            }}
            isProcessing={selectedUserForAction ? isActionProcessing(selectedUserForAction.id, currentActionType) : false}
        />
      )}
    </>
  );
};

export default UserTable;