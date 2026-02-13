'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addYears,
  subYears,
  format
} from 'date-fns';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  PlusCircle, 
  Wallet,
  Loader2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowRightCircle,
  Calendar as CalendarIcon
} from "lucide-react";
import Link from "next/link";

import { OverviewChart } from "@/components/dashboard/overview-chart";
import { CategoryDistributionChart } from "@/components/dashboard/category-distribution-chart";
import { TimeRangeFilter, type TimeRange } from "./time-range-filter";
import { AccountSummaryPopover } from "./account-summary-popover";
import { IconRenderer } from "../ui/icon-renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useTransactions, useDashboardSummary } from "@/lib/hooks/use-transactions";
import { cn } from "@/lib/utils";
import Image from 'next/image';

export function DashboardClient({ userName }: { userName: string }) {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [baseDate, setBaseDate] = useState(new Date());
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | undefined>();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filters = useMemo(() => {
    let start: Date;
    let end: Date;

    switch (timeRange) {
      case 'week':
        start = startOfWeek(baseDate, { weekStartsOn: 1 });
        end = endOfWeek(baseDate, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(baseDate);
        end = endOfMonth(baseDate);
        break;
      case 'year':
        start = startOfYear(baseDate);
        end = endOfYear(baseDate);
        break;
      case 'custom':
        start = customRange?.from || startOfMonth(new Date());
        end = customRange?.to || endOfMonth(new Date());
        break;
    }

    return {
      from: start.toISOString(),
      to: end.toISOString(),
    };
  }, [timeRange, baseDate, customRange]);

  const navigationLabel = useMemo(() => {
    const now = new Date();
    switch (timeRange) {
      case 'week':
        if (startOfWeek(baseDate, { weekStartsOn: 1 }).getTime() === startOfWeek(now, { weekStartsOn: 1 }).getTime()) {
          return 'THIS WEEK';
        }
        return `Week of ${format(startOfWeek(baseDate, { weekStartsOn: 1 }), 'MMM d')}`;
      case 'month':
        if (startOfMonth(baseDate).getTime() === startOfMonth(now).getTime()) {
          return 'THIS MONTH';
        }
        return format(baseDate, 'MMMM yyyy');
      case 'year':
        if (startOfYear(baseDate).getTime() === startOfYear(now).getTime()) {
          return 'THIS YEAR';
        }
        return format(baseDate, 'yyyy');
      case 'custom':
        if (customRange?.from && customRange?.to) {
          return `${format(customRange.from, 'MMM d')} - ${format(customRange.to, 'MMM d')}`;
        }
        return 'Custom Range';
    }
  }, [timeRange, baseDate, customRange]);

  const handleNavigate = (direction: 'prev' | 'next') => {
    switch (timeRange) {
      case 'week':
        setBaseDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
        break;
      case 'month':
        setBaseDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
        break;
      case 'year':
        setBaseDate(prev => direction === 'next' ? addYears(prev, 1) : subYears(prev, 1));
        break;
    }
  };

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary(filters);
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(filters);

  // Early return after all hooks to prevent hydration mismatch while following Rules of Hooks
  if (!mounted) return null;

  if (summaryLoading || transactionsLoading) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="font-mono text-muted-foreground text-sm animate-pulse">
          Fetching your financial data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Image
            src="/mascot.png"
            alt="Cockatiel"
            width={80}
            height={80}
            className="hidden md:block -scale-x-100"
            priority
          />
          <div className="px-2 md:px-0">
          <h1 className="font-bold text-3xl tracking-tight">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your finances today.</p>
        </div>
        </div>
        <div className="flex flex-col flex-wrap justify-center md:justify-end items-center gap-3">
          <TimeRangeFilter 
            value={timeRange} 
            onChange={(val) => {
              setTimeRange(val);
              setBaseDate(new Date()); // Reset to now when switching presets
            }} 
            onNavigate={handleNavigate}
            label={navigationLabel}
            customRange={customRange}
            onCustomRangeChange={setCustomRange}
          />
          {/* <div className="flex justify-center items-center gap-2 px-2 w-full">
            <Button className="w-1/2 max-w-[200px]" asChild size="sm">
              <Link href="/transactions/income">
                <PlusCircle className="mr-2 w-4 h-4" /> Income
              </Link>
            </Button>
            <Button className="w-1/2 max-w-[200px]" variant="outline" asChild size="sm">
              <Link href="/transactions/expense">
                <PlusCircle className="mr-2 w-4 h-4" /> Expense
              </Link>
            </Button>
          </div> */}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
        <Card className="group relative shadow-sm border-2 border-primary/10 overflow-hidden">
          <div className="right-0 bottom-0 absolute opacity-5 group-hover:opacity-10 p-4 rotate-12 transition-opacity translate-x-4 translate-y-4">
            <Wallet className="w-24 h-24" />
          </div>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Balance</CardTitle>
            <AccountSummaryPopover 
              accounts={summary?.accounts || []} 
            />
          </CardHeader>
          <CardContent>
            <div className="font-mono font-bold text-3xl">
              ${summary?.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="mt-1 text-muted-foreground text-xs">Across all your accounts</p>
          </CardContent>
        </Card>

        <Card className="group shadow-sm border-b-4 border-b-primary/50">
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Income</CardTitle>
            <ArrowUpCircle className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent className="flex flex-row justify-between items-end space-y-0 pb-2">
            <div>
              <div className="flex items-baseline gap-1 font-mono font-bold text-primary text-3xl">
              +${summary?.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
              <TrendingUp className="w-3 h-3" /> Your earnings
            </p>
            </div>
            <Button asChild size="sm">
              <Link href="/transactions/income">
                <PlusCircle className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group shadow-sm border-b-4 border-b-destructive/50">
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Expenses</CardTitle>
            <ArrowDownCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent className="flex flex-row justify-between items-end space-y-0 pb-2">
            <div>
            <div className="font-mono font-bold text-destructive text-3xl">
              -${summary?.expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
              <TrendingDown className="w-3 h-3" /> Your expenses
            </p>
            </div>
            <Button className="bg-destructive hover:bg-destructive/80" asChild size="sm">
              <Link href="/transactions/expense">
                <PlusCircle className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="gap-8 grid grid-cols-1 lg:grid-cols-7">
        {/* Recent Transactions */}
        <Card className="col-span-1 lg:col-span-3 shadow-sm border-2">
          <CardHeader className="flex flex-row justify-between items-center space-y-0">
            <div className="space-y-1">
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest activities in the selected period.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" asChild className="hover:bg-stone-200 transition-colors">
              <Link href="/transactions">
                <ArrowRightCircle className="w-5 h-5" />
                <span className="sr-only">View all transactions</span>
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="max-h-[350px] overflow-auto">
              <Table>
                <TableHeader className="top-0 z-10 sticky bg-background">
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.data && transactions.data.length > 0 ? (
                    transactions.data.map((transaction) => (
                      <TableRow key={transaction.id} className="group transition-colors">
                        <TableCell className="py-3">
                          <div className="flex flex-col">
                            <span className="font-medium group-hover:text-primary text-sm transition-colors">
                              {transaction.description}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <div 
                                className="flex justify-center items-center rounded-full w-5 h-5 text-white"
                                style={{ backgroundColor: transaction.category?.color || '#94a3b8' }}
                              >
                                <IconRenderer name={transaction.category?.icon || 'HelpCircle'} className="w-3 h-3" />
                              </div>
                              <span className="bg-muted px-1.5 py-0.5 rounded font-medium text-[10px] text-muted-foreground">
                                {transaction.category?.name || 'Uncategorized'}
                              </span>
                              <span className="font-mono text-[9px] text-muted-foreground/60 uppercase">
                                {new Date(transaction.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className={cn(
                          "font-mono font-bold text-right",
                          transaction.type === 'INCOME' ? 'text-primary' : 'text-destructive'
                        )}>
                          {transaction.type === 'INCOME' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="py-12 text-muted-foreground text-sm text-center italic">
                        No transactions found for this period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full text-muted-foreground hover:text-primary transition-colors" asChild>
                <Link href="/transactions">
                  View All Transactions
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Chart Area */}
        <Card className="col-span-1 lg:col-span-4 shadow-sm border-2">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Overview
              <span className="bg-muted px-2 py-1 rounded font-normal text-muted-foreground text-xs uppercase tracking-widest">
                {timeRange}
              </span>
            </CardTitle>
            <CardDescription>
              {timeRange === 'year' ? 'Monthly' : 'Daily'} breakdown of finances.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <OverviewChart data={summary?.chartData || []} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="gap-8 grid grid-cols-1 lg:grid-cols-2">
        <CategoryDistributionChart 
          title="Income Distribution" 
          description="Where your money comes from."
          data={summary?.categoryIncome || []}
          loading={summaryLoading}
        />
        <CategoryDistributionChart 
          title="Expense Distribution" 
          description="Where your money goes."
          data={summary?.categoryExpense || []}
          loading={summaryLoading}
        />
      </div>
    </div>
  );
}
