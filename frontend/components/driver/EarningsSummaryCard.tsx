// frontend/components/driver/EarningsSummaryCard.tsx
'use client';

import React from 'react';
import { EarningsSummary } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, CheckCircle, Banknote, Hourglass } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

interface EarningsSummaryCardProps {
  summary: EarningsSummary | null;
  isLoading: boolean;
}

const SummaryItem = ({ icon: Icon, title, value, valuePrefix = '', valueSuffix = '', isLoading, description }: {
  icon: React.ElementType;
  title: string;
  value: string | number | undefined;
  valuePrefix?: string;
  valueSuffix?: string;
  isLoading: boolean;
  description?: string;
}) => (
  <div className="flex flex-col p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow">
    <div className="flex items-center justify-between mb-1">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>
    {isLoading ? (
      <Skeleton className="h-7 w-3/4 rounded" />
    ) : (
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        {value !== undefined ? `${valuePrefix}${value}${valueSuffix}` : 'N/A'}
      </p>
    )}
    {description && !isLoading && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
  </div>
);


const EarningsSummaryCard = ({ summary, isLoading }: EarningsSummaryCardProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center">
          <TrendingUp className="mr-3 h-7 w-7 text-green-500" /> Earnings Overview
        </CardTitle>
        <CardDescription>
          A quick summary of your earnings and payout status.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <SummaryItem
            icon={DollarSign}
            title="Total Earned"
            value={summary?.totalEarned?.toFixed(2)}
            valuePrefix="$"
            isLoading={isLoading}
            description="Lifetime earnings before any fees."
        />
        <SummaryItem
            icon={Hourglass}
            title="Pending Payout"
            value={summary?.pendingPayout?.toFixed(2)}
            valuePrefix="$"
            isLoading={isLoading}
            description="Earnings processed and awaiting payout."
        />
        <SummaryItem
            icon={Banknote}
            title="Last Payout"
            value={summary?.lastPayoutAmount?.toFixed(2)}
            valuePrefix="$"
            isLoading={isLoading}
            description={summary?.lastPayoutDate ? `On ${format(new Date(summary.lastPayoutDate), 'MMM d, yyyy')}` : 'No payouts yet.'}
        />
         {/* You can add more items like Rides Completed */}
        {/* <SummaryItem
            icon={CheckCircle}
            title="Rides Completed"
            value={summary?.ridesCompletedCount}
            isLoading={isLoading}
            description="Total number of successful rides."
        /> */}
      </CardContent>
    </Card>
  );
};

export default EarningsSummaryCard;