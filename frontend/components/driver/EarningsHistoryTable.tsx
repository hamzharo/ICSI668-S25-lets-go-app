// frontend/components/driver/EarningsHistoryTable.tsx
'use client';

import React from 'react';
import { EarningTransaction } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { DollarSign, CalendarCheck2, MapPin, Users, CheckCircle, AlertCircle, Clock, RefreshCw, FileSpreadsheet } from 'lucide-react'; // Added FileSpreadsheet for empty
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EarningsHistoryTableProps {
  transactions: EarningTransaction[];
  isLoading: boolean;
  // onRowClick?: (transaction: EarningTransaction) => void; // Optional: if clicking a row shows more details
}

const getPayoutStatusProps = (status: EarningTransaction['payoutStatus']): { text: string; Icon: React.ElementType; colorClass: string; badgeVariant: "default" | "destructive" | "secondary" | "outline" | "success" } => {
  switch (status) {
    case 'PAID_OUT':
      return { text: 'Paid Out', Icon: CheckCircle, colorClass: 'text-green-600 dark:text-green-400', badgeVariant: 'success' };
    case 'PENDING':
      return { text: 'Pending', Icon: Clock, colorClass: 'text-yellow-600 dark:text-yellow-400', badgeVariant: 'secondary' };
    case 'PROCESSING':
      return { text: 'Processing', Icon: RefreshCw, colorClass: 'text-blue-600 dark:text-blue-400', badgeVariant: 'default' };
    case 'FAILED':
      return { text: 'Failed', Icon: AlertCircle, colorClass: 'text-red-600 dark:text-red-400', badgeVariant: 'destructive' };
    default:
      return { text: status, Icon: AlertCircle, colorClass: 'text-gray-500', badgeVariant: 'outline' };
  }
};

const EarningsHistoryTable = ({ transactions, isLoading }: EarningsHistoryTableProps) => {

  const renderSkeletons = (count: number) => {
    return Array(count).fill(0).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton className="h-5 w-32 rounded" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24 rounded" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16 rounded" /></TableCell>
        <TableCell><Skeleton className="h-5 w-20 rounded" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto rounded" /></TableCell>
      </TableRow>
    ));
  };


  if (isLoading && transactions.length === 0) {
    return (
      <div className="rounded-md border dark:border-gray-700">
        <Table>
            <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                    <TableHead className="px-4 py-3">Ride / Transaction ID</TableHead>
                    <TableHead className="px-4 py-3">Date Completed</TableHead>
                    <TableHead className="px-4 py-3">Amount Earned</TableHead>
                    <TableHead className="px-4 py-3">Payout Status</TableHead>
                    <TableHead className="text-right px-4 py-3">Payout Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {renderSkeletons(5)} {/* Show 5 skeleton rows while loading */}
            </TableBody>
        </Table>
      </div>
    );
  }

  if (!isLoading && transactions.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md dark:border-gray-700 bg-slate-50 dark:bg-slate-800/30">
        <FileSpreadsheet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Earnings History</h3>
        <p className="text-muted-foreground mt-1">You have not completed any rides that resulted in earnings yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border dark:border-gray-700">
      <Table>
        <TableCaption className="py-4">A list of your recent earning transactions.</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/30">
            <TableHead className="px-4 py-3 w-[250px]">Ride Details</TableHead>
            <TableHead className="px-4 py-3">Date Completed</TableHead>
            <TableHead className="px-4 py-3 text-right">Amount Earned</TableHead>
            <TableHead className="px-4 py-3">Payout Status</TableHead>
            <TableHead className="px-4 py-3 text-right">Payout Date</TableHead>
            {/* <TableHead className="text-right px-4 py-3">Actions</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const { text: statusText, Icon: StatusIcon, colorClass: statusColorClass, badgeVariant: statusBadgeVariant } = getPayoutStatusProps(tx.payoutStatus);
            return (
              <TableRow key={tx.transactionId} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                <TableCell className="font-medium px-4 py-3">
                  <Link href={`/rides/${tx.rideId}`} className="hover:underline text-primary dark:text-blue-400 block">
                    {tx.rideDepartureCity} to {tx.rideDestinationCity}
                  </Link>
                  <span className="text-xs text-muted-foreground block">Ride ID: {tx.rideId}</span>
                  {/* <span className="text-xs text-muted-foreground block">Tx ID: {tx.transactionId}</span> */}
                </TableCell>
                <TableCell className="px-4 py-3">
                    <div className="flex items-center text-xs">
                        <CalendarCheck2 className="mr-1.5 h-4 w-4 text-muted-foreground" />
                        {format(new Date(tx.rideCompletionDate), "MMM d, yyyy")}
                    </div>
                </TableCell>
                <TableCell className="text-right px-4 py-3">
                  <span className="font-semibold text-green-600 dark:text-green-400">${tx.amountEarned.toFixed(2)}</span>
                  {tx.platformFee && <span className="text-xs text-muted-foreground block">(-${tx.platformFee.toFixed(2)} fee)</span>}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge variant={statusBadgeVariant} className={`capitalize text-xs px-2.5 py-1 ${statusColorClass} border ${statusColorClass.replace('text-', 'border-')}`}>
                    <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                    {statusText}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-4 py-3 text-xs text-muted-foreground">
                  {tx.payoutDate ? format(new Date(tx.payoutDate), "MMM d, yyyy") : 'N/A'}
                </TableCell>
                {/* <TableCell className="text-right px-4 py-3">
                  <Button variant="ghost" size="sm" onClick={() => onRowClick && onRowClick(tx)}>View</Button>
                </TableCell> */}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {/* TODO: Add Pagination controls here if the API supports pagination */}
    </div>
  );
};

export default EarningsHistoryTable;