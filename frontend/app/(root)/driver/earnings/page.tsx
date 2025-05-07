// frontend/app/(root)/driver/earnings/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { EarningsSummary, EarningTransaction } from '@/types';
import EarningsSummaryCard from '@/components/driver/EarningsSummaryCard';
import EarningsHistoryTable from '@/components/driver/EarningsHistoryTable';
import { toast } from 'react-toastify';
import { Loader2, DollarSign, Frown, ShieldAlert, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
// import { DateRangePicker } from '@/components/ui/daterangepicker'; // If you add date filtering

// --- TODO: Replace with actual API service calls ---
const fetchEarningsSummaryApi = async (token: string | null): Promise<EarningsSummary> => {
  if (!token) throw new Error("Authentication required.");
  console.log("API CALL: Fetching earnings summary");
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/driver/earnings/summary`, {
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // if (!response.ok) {
  //   const errorResult = await response.json().catch(() => ({ message: "Failed to fetch earnings summary." }));
  //   throw new Error(errorResult.message);
  // }
  // return response.json();

  // Mock API response:
  return new Promise(resolve => setTimeout(() => {
    resolve({
      totalEarned: 1250.75,
      pendingPayout: 150.25,
      lastPayoutAmount: 300.50,
      lastPayoutDate: new Date(Date.now() - 86400000 * 7).toISOString(),
      ridesCompletedCount: 25,
    });
  }, 800));
};

const fetchEarningsHistoryApi = async (token: string | null /*, dateRange?: {from: Date, to: Date} */): Promise<EarningTransaction[]> => {
  if (!token) throw new Error("Authentication required.");
  console.log("API CALL: Fetching earnings history"); // Add dateRange if implementing filtering
  // let url = `${process.env.NEXT_PUBLIC_API_URL}/api/driver/earnings/history`;
  // if (dateRange && dateRange.from && dateRange.to) {
  //   url += `?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`;
  // }
  // const response = await fetch(url, {
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // if (!response.ok) {
  //   const errorResult = await response.json().catch(() => ({ message: "Failed to fetch earnings history." }));
  //   throw new Error(errorResult.message);
  // }
  // return response.json();

  // Mock API response:
  return new Promise(resolve => setTimeout(() => {
    resolve([
      { transactionId: 'tx_mock_1', rideId: 'ride_earn_1', rideDepartureCity: 'Cityville', rideDestinationCity: 'Townsburg', rideCompletionDate: new Date(Date.now() - 86400000 * 3).toISOString(), amountEarned: 25.50, platformFee: 2.55, payoutStatus: 'PAID_OUT', payoutDate: new Date(Date.now() - 86400000 * 2).toISOString() },
      { transactionId: 'tx_mock_2', rideId: 'ride_earn_2', rideDepartureCity: 'Metro Area', rideDestinationCity: 'Suburbia', rideCompletionDate: new Date(Date.now() - 86400000 * 1).toISOString(), amountEarned: 30.00, platformFee: 3.00, payoutStatus: 'PENDING' },
      { transactionId: 'tx_mock_3', rideId: 'ride_earn_3', rideDepartureCity: 'Old Port', rideDestinationCity: 'New Harbor', rideCompletionDate: new Date(Date.now() - 86400000 * 5).toISOString(), amountEarned: 18.75, payoutStatus: 'PAID_OUT', payoutDate: new Date(Date.now() - 86400000 * 4).toISOString() },
    ]);
  }, 1200));
};
// --- End TODO ---


export default function DriverEarningsPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [transactions, setTransactions] = useState<EarningTransaction[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>(undefined); // For date filtering

  const loadEarningsData = useCallback(async () => {
    if (!token || user?.role !== 'DRIVER') {
        if(!authLoading) { // If auth done and still no token/driver
            setIsLoadingSummary(false);
            setIsLoadingHistory(false);
        }
      return;
    }

    setIsLoadingSummary(true);
    setIsLoadingHistory(true);
    setError(null);

    try {
      // Fetch summary and history in parallel
      const [summaryData, historyData] = await Promise.all([
        fetchEarningsSummaryApi(token),
        fetchEarningsHistoryApi(token /*, dateRange */), // Pass dateRange if implemented
      ]);
      setSummary(summaryData);
      setTransactions(historyData);
    } catch (err: any) {
      console.error("Failed to load earnings data:", err);
      const errorMessage = err.message || "Could not load your earnings information.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingSummary(false);
      setIsLoadingHistory(false);
    }
  }, [token, user, authLoading /*, dateRange */]); // Add authLoading & dateRange if used

  useEffect(() => {
    if (!authLoading && user?.role === 'DRIVER') {
      loadEarningsData();
    } else if (!authLoading && user?.role !== 'DRIVER') {
      toast.error("Access Denied. This page is for drivers only.");
      router.replace("/");
      setIsLoadingSummary(false);
      setIsLoadingHistory(false);
    }
  }, [authLoading, user, loadEarningsData, router]);


  if (authLoading) { // Initial auth loading
    return <div className="flex flex-grow items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!user || user.role !== 'DRIVER') {
    // Fallback if redirect hasn't happened
    return (
        <div className="flex flex-col flex-grow items-center justify-center p-6 text-center">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-semibold text-destructive mb-2">Access Denied</h2>
            <p className="text-muted-foreground max-w-md">This page is for drivers only.</p>
        </div>
    );
  }

  if (error && !isLoadingSummary && !isLoadingHistory) { // Show error only if not loading
    return (
      <div className="flex flex-col flex-grow items-center justify-center p-6 text-center">
        <Frown className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Earnings</h2>
        <p className="text-muted-foreground max-w-md mb-6">{error}</p>
        <Button onClick={loadEarningsData} variant="outline">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow p-4 md:p-6 lg:p-8 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white flex items-center">
            <DollarSign className="mr-3 h-8 w-8 text-green-600" /> Driver Earnings
            </h1>
            <p className="text-lg text-muted-foreground dark:text-gray-400 mt-1">
            Track your income, review payouts, and manage your finances.
            </p>
        </div>
        {/* Optional: Date Range Picker for filtering history
        <div className="self-start sm:self-center">
            <DateRangePicker onUpdate={(values) => setDateRange(values.range)} />
        </div>
        */}
      </header>

      <EarningsSummaryCard summary={summary} isLoading={isLoadingSummary} />

      <Separator className="my-6 md:my-8" />

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1 flex items-center">
            <BarChart3 className="mr-2 h-6 w-6 text-blue-500"/>Earnings History
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
            Detailed breakdown of your earnings from completed rides.
        </p>
        <EarningsHistoryTable transactions={transactions} isLoading={isLoadingHistory} />
      </div>
    </div>
  );
}