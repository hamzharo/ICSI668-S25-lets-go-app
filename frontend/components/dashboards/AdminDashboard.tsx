// frontend/components/dashboards/AdminDashboard.tsx
'use client';

import React from 'react';
import { User } from '@/types'; // Assuming User type is in @/types
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from 'next/link';
import { FileCheck2, Files, Users, ShieldCheck, Settings2 } from 'lucide-react'; // Icons

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard = ({ user }: AdminDashboardProps) => {
  // In a real app, you might fetch some stats here like number of pending documents
  // const [pendingDocumentsCount, setPendingDocumentsCount] = useState(0);
  // useEffect(() => { /* Fetch stats */ }, []);

  return (
    <div className="flex flex-col flex-grow p-6 md:p-8 lg:p-10 space-y-8">
      {/* Welcome Header */}
      <header className="mb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
          Administrator Panel
        </h1>
        <p className="text-lg text-muted-foreground dark:text-gray-400">
          Welcome, {user.firstName}. Manage application data and user activities.
        </p>
      </header>

      {/* Main Action Cards/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Card 1: Document Verification Queue */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
             <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">Document Review</CardTitle>
                <FileCheck2 className="h-8 w-8 text-orange-500" />
            </div>
            <CardDescription className="pt-1">
              Review and verify or reject user-submitted documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Access the queue of documents pending verification. Ensure compliance and maintain platform integrity by processing driver applications.
            </p>
            {/* <p className="text-sm font-semibold">Pending Documents: <span className="text-orange-600">{pendingDocumentsCount || 'Loading...'}</span></p> */}
          </CardContent>
          <CardFooter>
            <Link href="/admin/document-review" passHref legacyBehavior>
              <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                <FileCheck2 className="mr-2 h-5 w-5" /> Go to Verification Queue
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Card 2: All Documents Overview */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">All Documents</CardTitle>
                <Files className="h-8 w-8 text-blue-500" />
            </div>
            <CardDescription className="pt-1">
              Browse, search, and manage all uploaded documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View the complete history of documents, filter by status, user, or type. Useful for audits and historical lookups.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/all-documents" passHref legacyBehavior>
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Files className="mr-2 h-5 w-5" /> Browse All Documents
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Card 3: User Management (Optional - if you have user management endpoints for admin) */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">User Management</CardTitle>
                <Users className="h-8 w-8 text-indigo-500" />
            </div>
            <CardDescription className="pt-1">
              View, search, and manage user accounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Oversee user registrations, update roles, suspend accounts, or view user activity. (Functionality depends on backend support).
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/users" passHref legacyBehavior>
              <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                <Users className="mr-2 h-5 w-5" /> Manage Users
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Add more admin-specific cards if needed, e.g., System Settings, Ride Monitoring, Reports */}
        {/* Example: System Health / Analytics (if available)
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
             <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">System Analytics</CardTitle>
                <Settings2 className="h-8 w-8 text-teal-500" />
            </div>
            <CardDescription className="pt-1">
              View application performance and usage statistics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Monitor key metrics, active users, ride volumes, and system health.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/analytics" passHref legacyBehavior>
              <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                <Settings2 className="mr-2 h-5 w-5" /> View Analytics
              </Button>
            </Link>
          </CardFooter>
        </Card>
        */}
      </div>
    </div>
  );
};

export default AdminDashboard;