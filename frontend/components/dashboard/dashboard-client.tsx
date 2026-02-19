'use client';

import { useState, useEffect } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  PlusCircle,
  Wallet,
  Loader2,
  ArrowRightCircle,
} from "lucide-react";
import Link from "next/link";
import { MotionDiv, staggerContainer, slideUp } from "../ui/motion";

import { OverviewChart } from "@/components/dashboard/overview-chart";
import { CategoryDistributionChart } from "@/components/dashboard/category-distribution-chart";
import { TimeRangeFilter } from "./time-range-filter";
import { AccountSummaryPopover } from "./account-summary-popover";
import { SummaryCard } from "./summary-card";
import { IconRenderer } from "../ui/icon-renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, MotionTableBody, MotionTableRow,
} from "@/components/ui/table";
import { useTransactions, useDashboardSummary } from "@/lib/hooks/use-transactions";
import { useDateRange } from "@/lib/hooks/use-date-range";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import Image from 'next/image';
import { title } from 'process';

export function DashboardClient({ userName }: { userName: string }) {
  const [mounted, setMounted] = useState(false);
  const { preset, setPreset, navigate, label, customRange, setCustomRange, filters } = useDateRange('week');

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary(filters);
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(filters);

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
            alt="Mascot"
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
            value={preset}
            onChange={setPreset}
            onNavigate={navigate}
            label={label}
            customRange={customRange}
            onCustomRangeChange={setCustomRange}
          />
        </div>
      </div>



      {/* Summary Cards */}
      <MotionDiv 
        className="gap-4 grid grid-cols-1 md:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <MotionDiv variants={slideUp}>
          <Card className="group relative shadow-sm border-2 border-primary/10 h-full overflow-hidden">
            <div className="right-0 bottom-0 absolute opacity-5 group-hover:opacity-10 p-4 rotate-12 transition-opacity translate-x-4 translate-y-4">
              <Wallet className="w-24 h-24" />
            </div>
            <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Total Balance</CardTitle>
              <AccountSummaryPopover accounts={summary?.accounts || []} />
            </CardHeader>
            <CardContent>
              <div className="font-mono font-bold text-3xl">
                {formatCurrency(summary?.totalBalance ?? 0)}
              </div>
              <p className="mt-1 text-muted-foreground text-xs">Across all your accounts</p>
            </CardContent>
          </Card>
        </MotionDiv>

        <MotionDiv variants={slideUp}>
          <SummaryCard
            title="Income"
            value={summary?.income}
            icon={ArrowUpCircle}
            variant="income"
            prefix="+"
            subtitle="Your earnings"
            className="border-b-4 border-b-primary/50 h-full"
            action={
              <Button asChild size="sm">
                <Link href="/transactions/income">
                  <PlusCircle className="w-4 h-4" />
                </Link>
              </Button>
            }
          />
        </MotionDiv>

        <MotionDiv variants={slideUp}>
          <SummaryCard
            title="Expenses"
            value={summary?.expense}
            icon={ArrowDownCircle}
            variant="expense"
            prefix="-"
            subtitle="Your expenses"
            className="border-b-4 border-b-destructive/50 h-full"
            action={
              <Button className="bg-destructive hover:bg-destructive/80" asChild size="sm">
                <Link href="/transactions/expense">
                  <PlusCircle className="w-4 h-4" />
                </Link>
              </Button>
            }
          />
        </MotionDiv>
      </MotionDiv>

      <MotionDiv 
        className="gap-8 grid grid-cols-1 lg:grid-cols-7"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Recent Transactions */}
        <MotionDiv className="col-span-1 lg:col-span-3 h-full" variants={slideUp}>
        <Card className="shadow-sm border-2 h-full">
          <CardHeader className="flex flex-row justify-between items-center space-y-0">
            <div className="space-y-1">
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest activities in the selected period.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" asChild className="hover:bg-muted transition-colors">
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
                <MotionTableBody
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {transactions?.data && transactions.data.length > 0 ? (
                    transactions.data.map((transaction) => (
                      <MotionTableRow key={transaction.id} className="group transition-colors" variants={slideUp}>
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
                          {transaction.type === 'INCOME' ? '+' : '-'}
                          {formatCurrency(parseFloat(transaction.amount))}
                        </TableCell>
                      </MotionTableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="py-12 text-muted-foreground text-sm text-center italic">
                        No transactions found for this period.
                      </TableCell>
                    </TableRow>
                  )}
                </MotionTableBody>
              </Table>
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full text-muted-foreground hover:text-primary transition-colors" asChild>
                <Link href="/transactions">View All Transactions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        </MotionDiv>

        {/* Chart Area */}
        <MotionDiv className="col-span-1 lg:col-span-4 h-full" variants={slideUp}>
          <Card className="shadow-sm border-2 h-full">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Overview
                <span className="bg-muted px-2 py-1 rounded font-normal text-muted-foreground text-xs uppercase tracking-widest">
                  {preset}
                </span>
              </CardTitle>
              <CardDescription>
                {preset === 'year' ? 'Monthly' : 'Daily'} breakdown of finances.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <OverviewChart data={summary?.chartData || []} />
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      </MotionDiv>

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
