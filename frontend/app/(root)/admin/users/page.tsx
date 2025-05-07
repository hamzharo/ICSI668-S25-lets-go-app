// frontend/app/(root)/admin/users/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { AdminUserView, UserFilterValues, UserRole } from '@/types'; // Added UserRole
import UserTable from '@/components/admin/UserTable';
import UserFilters from '@/components/admin/UserFilters';
import { toast } from 'react-toastify';
import { Loader2, Users, Frown, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { UserActionType } from '@/components/admin/UserActionDialog'; // Import UserActionType

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface PaginatedUsersResponse { /* ... (as defined before) ... */ content: AdminUserView[]; totalPages: number; totalElements: number; currentPage: number; size: number; }

// --- TODO: Replace/Update API service calls ---
const fetchAdminUsersApi = async ( /* ... */ ): Promise<PaginatedUsersResponse> => { /* ... (as defined before) ... */ return new Promise(res => res({content:[], totalPages:0, totalElements:0,currentPage:0,size:0}))};

// New API call for updating user role
const updateUserRoleApi = async (userId: string, newRole: UserRole, token: string | null): Promise<AdminUserView> => {
  if (!token) throw new Error("Authentication required.");
  console.log(`API CALL: Updating user ${userId} role to ${newRole}`);
  // const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role?newRole=${newRole}`, {
  //   method: 'PUT',
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // if (!response.ok) { /* ... error handling ... */ throw new Error("Failed to update user role."); }
  // return response.json(); // Expect updated user object
  return new Promise(resolve => setTimeout(() => resolve({ id: userId, role: newRole } as AdminUserView), 800)); // Mock
};

// New API call for updating user account status (suspend/unsuspend)
const updateUserAccountStatusApi = async (userId: string, newStatus: 'ACTIVE' | 'SUSPENDED', token: string | null): Promise<AdminUserView> => {
  if (!token) throw new Error("Authentication required.");
  console.log(`API CALL: Updating user ${userId} account status to ${newStatus}`);
  // const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/account-status?newAccountStatus=${newStatus}`, { // Endpoint TBD
  //   method: 'PUT',
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // if (!response.ok) { /* ... error handling ... */ throw new Error("Failed to update account status."); }
  // return response.json();
  return new Promise(resolve => setTimeout(() => resolve({ id: userId, accountStatus: newStatus } as AdminUserView), 800)); // Mock
};
// --- End TODO ---


export default function ManageUsersAdminPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [usersList, setUsersList] = useState<AdminUserView[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState<UserFilterValues>({ role: 'ALL', status: 'ALL', searchTerm: '' });

  // State to track processing of individual user actions
  // Key: `userId_actionType`, Value: boolean
  const [processingUserActions, setProcessingUserActions] = useState<Record<string, boolean>>({});

  const loadUsers = useCallback(async (pageToLoad: number) => { /* ... (same as before) ... */ if (!token || user?.role !== 'ADMIN') { setIsLoadingData(false); return; } setIsLoadingData(true); setError(null); try { const response = await fetchAdminUsersApi(filters, pageToLoad, itemsPerPage, token); setUsersList(response.content); setTotalPages(response.totalPages); setCurrentPage(response.currentPage); setTotalElements(response.totalElements); } catch (err: any) { setError(err.message); toast.error(err.message); } finally { setIsLoadingData(false); } }, [token, user, authLoading, filters]);
  useEffect(() => { if (!authLoading && user?.role === 'ADMIN') { loadUsers(currentPage); } else if (!authLoading && user?.role !== 'ADMIN') { router.replace("/"); } }, [authLoading, user, filters, loadUsers, router, currentPage]);
  const handleFilterChange = (newFilters: UserFilterValues) => { setCurrentPage(0); setFilters(newFilters); };
  const handlePageChange = (newPage: number) => { if (newPage >= 0 && newPage < totalPages) setCurrentPage(newPage); };


  const handleUserAction = async (userId: string, actionType: UserActionType, data?: any) => {
    const actionKey = `${userId}_${actionType}`;
    setProcessingUserActions(prev => ({ ...prev, [actionKey]: true }));
    try {
      let successMessage = '';
      if (actionType === 'CHANGE_ROLE' && data?.newRole) {
        await updateUserRoleApi(userId, data.newRole, token);
        successMessage = `User role updated to ${data.newRole}.`;
      } else if (actionType === 'SUSPEND_USER') {
        await updateUserAccountStatusApi(userId, 'SUSPENDED', token);
        successMessage = 'User account suspended.';
      } else if (actionType === 'UNSUSPEND_USER') {
        await updateUserAccountStatusApi(userId, 'ACTIVE', token);
        successMessage = 'User account reactivated.';
      }
      toast.success(successMessage);
      loadUsers(currentPage); // Refresh the current page of users
    } catch (err: any) {
      toast.error(err.message || `Failed to perform action: ${actionType}`);
    } finally {
      setProcessingUserActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const isActionProcessing = (userId: string, actionType: UserActionType): boolean => {
    return !!processingUserActions[`${userId}_${actionType}`];
  };


  if (authLoading || (!user && isLoadingData && usersList.length === 0)) { /* ... Loader ... */ return <div className="flex flex-grow items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>; }
  if (!user || user.role !== 'ADMIN') { /* ... Access Denied ... */ return ( <div className="flex flex-col flex-grow items-center justify-center p-6 text-center"> <ShieldAlert className="h-16 w-16 text-destructive mb-4" /> <h2 className="text-2xl font-semibold text-destructive mb-2">Access Denied</h2> <p className="text-muted-foreground max-w-md">Admin access required.</p> </div> ); }
  if (error && !isLoadingData) { /* ... Error display ... */  return ( <div className="flex flex-col flex-grow items-center justify-center p-6 text-center"> <Frown className="h-16 w-16 text-destructive mb-4" /> <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Users</h2> <p className="text-muted-foreground max-w-md mb-6">{error}</p> <Button onClick={() => loadUsers(currentPage)} variant="outline">Try Again</Button> </div> );}

  return (
    <div className="flex flex-col flex-grow p-4 md:p-6 lg:p-8 space-y-6">
      {/* ... (Header and UserFilters - same as before) ... */}
      <header className="mb-2"> <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white flex items-center"> <Users className="mr-3 h-8 w-8 text-indigo-500" /> User Management </h1> <p className="text-lg text-muted-foreground dark:text-gray-400 mt-1"> View, search, and manage all users in the system. </p> </header>
      <UserFilters initialFilters={filters} onFilterChange={handleFilterChange} />
      <Separator className="my-4 md:my-6" />

      <UserTable
        users={usersList}
        isLoading={isLoadingData}
        onUserAction={handleUserAction}
        isActionProcessing={isActionProcessing}
      />

      {/* ... (Pagination Controls - same as before) ... */}
      {totalPages > 1 && !isLoadingData && ( <div className="mt-6 flex justify-center"> <Pagination> <PaginationContent> <PaginationItem> <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} className={currentPage === 0 ? "pointer-events-none opacity-50" : undefined} /> </PaginationItem> {[...Array(totalPages).keys()].map(pageNumber => ( (pageNumber === 0 || pageNumber === totalPages - 1 || Math.abs(pageNumber - currentPage) <= 1 || (currentPage <=2 && pageNumber <=3) || (currentPage >= totalPages -3 && pageNumber >= totalPages -4) ) ? ( <PaginationItem key={pageNumber}> <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(pageNumber); }} isActive={currentPage === pageNumber} > {pageNumber + 1} </PaginationLink> </PaginationItem> ) : ( (Math.abs(pageNumber - currentPage) === 2 && totalPages > 5 && !((currentPage <=2 && pageNumber <=3) || (currentPage >= totalPages -3 && pageNumber >= totalPages -4))) || (pageNumber === 1 && currentPage > 3 && totalPages > 5) || (pageNumber === totalPages -2 && currentPage < totalPages-4 && totalPages > 5)  )  ? ( <PaginationItem key={`ellipsis-${pageNumber}`}> <PaginationEllipsis /> </PaginationItem> ) : null ))} <PaginationItem> <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : undefined} /> </PaginationItem> </PaginationContent> </Pagination> </div> )}
      {!isLoadingData && usersList.length > 0 && <p className="text-center text-sm text-muted-foreground mt-2">Showing {usersList.length} of {totalElements} users.</p>}
      {!isLoadingData && totalElements === 0 && ( <div className="text-center py-10 border rounded-md dark:border-gray-700 bg-slate-50 dark:bg-slate-800/30"> <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" /> <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Users Found</h3> <p className="text-muted-foreground mt-1">No users match the current filter criteria.</p> </div> )}
    </div>
  );
}