// frontend/app/(root)/driver/dashboard/page.tsx
'use client';

import DriverDashboard from '@/components/dashboards/DriverDashboard';
import { useAuth } from '@/lib/AuthContext';
import { Loader2 } from 'lucide-react'; // Assuming Loader2 is your loading spinner icon

export default function DashboardPage() {
  const { user, isLoading } = useAuth(); // Auth context provides user

  if (isLoading || !user) {
    // Auth isLoading or user not yet available from context
    return (
      <div className="flex flex-grow items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // User is guaranteed to be a DRIVER here due to DriverLayout
  return <DriverDashboard user={user} />;
}