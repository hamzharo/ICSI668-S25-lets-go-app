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
const fetchAdminUsersApi = async (
  filters: UserFilterValues,
  page: number, // Note: Backend now ignores this
  size: number, // Note: Backend now ignores this
  token: string | null
): Promise<PaginatedUsersResponse> => {
  // Check for token
  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  console.log("fetchAdminUsersApi received - page:", page, "size:", size);

  // Construct URL - Backend will ignore pagination/filter params now, but we can still send them
  // Or simplify the URL if you know the backend ignores them entirely:
  // const url = `${API_BASE_URL}/api/users`;
  const params = new URLSearchParams(); // Start fresh or add only params the backend *might* use
  // Add filters IF your reverted backend still handles them (unlikely based on the code)
  // if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
  // if (filters.role && filters.role !== 'ALL') params.append('role', filters.role);
  // if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);

  // Use a simpler URL if backend ignores all params for this endpoint now
  const url = `${API_BASE_URL}/api/users` + (params.toString() ? `?${params.toString()}` : '');
  console.log(`API CALL: Fetching users from ${url}`);

  // Make API call
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      // 'Content-Type': 'application/json', // Not strictly needed for GET
    },
  });

  // For unsuccessful responses
  if (!response.ok) {
    let errorMessage = `Failed to fetch users. Status: ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
    } catch (e) {
      // Ignore if error response is not JSON
    }
    console.error("API Error:", errorMessage, response);
    throw new Error(errorMessage);
  }

  // --- MODIFICATION START ---
  // Parse successful JSON response - EXPECT AN ARRAY NOW
  const userArray: AdminUserView[] = await response.json();

  // Validate if it's an array
  if (!Array.isArray(userArray)) {
    console.error("API Error: Expected an array but received non-array:", userArray);
    throw new Error("Received invalid data structure from API (expected array).");
  }

  console.log("API Success: Received user array (length):", userArray.length);

  // Manually construct the PaginatedUsersResponse object
  const simulatedResponse: PaginatedUsersResponse = {
    content: userArray, // The full list is the content
    totalPages: 1, // Since we got everything, there's only 1 "page"
    totalElements: userArray.length, // Total elements is the array length
    currentPage: 0, // We are on the first (and only) page
    size: userArray.length, // The size of this "page" is the full array length
  };

  // --- MODIFICATION END ---

  // No need for the old validation check anymore
  // if (!data || typeof data.content === 'undefined' || ...)

  console.log("API Success: Simulated Paginated Response", simulatedResponse);
  return simulatedResponse; // Return the constructed object
};

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

  const loadUsers = useCallback(async (pageToLoad: number) => { 
    console.log("loadUsers called with pageToLoad:", pageToLoad);

    if (!token || !user?.roles?.includes('ADMIN')) { 
      setIsLoadingData(false); return; 
    } 
    
    setIsLoadingData(true); 
    setError(null); 
    try { 
      const response = await fetchAdminUsersApi(filters, pageToLoad, itemsPerPage, token); 
      setUsersList(response.content); setTotalPages(response.totalPages); 
      setCurrentPage(response.currentPage); setTotalElements(response.totalElements); 
    } catch (err: any) { 
      console.error("CAUGHT ERROR OBJECT:", err); // Log the whole error object
      console.error("CAUGHT ERROR MESSAGE TYPE:", typeof err?.message); // What is the type?
      console.error("CAUGHT ERROR MESSAGE VALUE:", err?.message); // What is the value?

      const message = err?.message || "An unknown error occurred loading users."; // Safer way to get message
      setError(err.message); 
      toast.error(err.message); 
    } finally { 
      setIsLoadingData(false); 
    } 
  }, [token, user, authLoading, filters]);

  useEffect(() => { 
    if (!authLoading && user?.roles?.includes('ADMIN')) { 
      loadUsers(currentPage); 
    } 
    else if (!authLoading && !user?.roles?.includes('ADMIN')) { 
      router.replace("/"); 
    } 
  }, [authLoading, user, filters, loadUsers, router, currentPage]);
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
  if (!user || !user.roles?.includes('ADMIN')) { /* ... Access Denied ... */ return ( <div className="flex flex-col flex-grow items-center justify-center p-6 text-center"> <ShieldAlert className="h-16 w-16 text-destructive mb-4" /> <h2 className="text-2xl font-semibold text-destructive mb-2">Access Denied</h2> <p className="text-muted-foreground max-w-md">Admin access required.</p> </div> ); }
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