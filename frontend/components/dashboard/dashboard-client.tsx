'use client';

import { useState, useEffect } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  PlusCircle,
  Wallet,
  Loader2,
  ArrowRightCircle,
  Eye,
  EyeOff,
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
import { useTransactions, useDashboardSummary } from "@/lib/hooks/use-transactions";
import { useDateRange } from "@/lib/hooks/use-date-range";
import { useUser } from "@/lib/hooks/use-user";
import { useExchangeRates, convertCurrency } from "@/lib/hooks/use-exchange-rates";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import Image from 'next/image';
import { title } from 'process';

export function DashboardClient({ userName }: { userName: string }) {
  const [mounted, setMounted] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [hasSetDefaultPeriod, setHasSetDefaultPeriod] = useState(false);
  
  const { preset, setPreset, navigate, label, customRange, setCustomRange, filters } = useDateRange('week');
  const { data: userPref, isLoading: userPrefLoading } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (userPref?.defaultPeriod && !hasSetDefaultPeriod) {
      setPreset(userPref.defaultPeriod as any);
      setHasSetDefaultPeriod(true);
    }
  }, [userPref?.defaultPeriod, hasSetDefaultPeriod, setPreset]);

  const prefCode = userPref?.preferredCurrencyCode || 'USD';
  
  const { data: rates, isLoading: ratesLoading } = useExchangeRates(prefCode);
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary(filters);
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(filters);

  const calculateConvertedBalance = () => {
    if (!summary?.accounts) return 0;
    return summary.accounts
      .filter((account) => account.isVisible !== false)
      .reduce((acc, account) => {
        const code = account.currencyCode || 'USD';
        return acc + convertCurrency(account.balance, code, prefCode, rates);
      }, 0);
  };

  const calculateConvertedTotal = (val?: number) => {
     // If we had per-transaction currency we would map it here,
     // assuming for now that summary.income/expense are already in native base...
     // wait, if summary sends a raw 0 it should be formatted.
     return val ?? 0;
  };

  if (!mounted) return null;

  if (summaryLoading || transactionsLoading || userPrefLoading || ratesLoading) {
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
            <div className="right-0 bottom-0 absolute opacity-5 p-4 rotate-12 transition-opacity translate-x-4 translate-y-4">
              <Wallet className="w-24 h-24" />
            </div>
            <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Total Balance</CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 text-muted-foreground hover:text-primary cursor-pointer"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <AccountSummaryPopover accounts={summary?.accounts || []} />
              </div>
            </CardHeader>
            <CardContent>
              <AccountSummaryPopover
                accounts={summary?.accounts || []}
                trigger={
                  <div className={cn("rounded-lg w-fit font-mono font-bold text-3xl transition-all cursor-pointer hover:opacity-80 active:scale-95", !showBalance && "text-gray-300 bg-gray-300")}>
                    {formatCurrency(calculateConvertedBalance(), prefCode)}
                  </div>
                }
              />
              <p className="mt-1 text-muted-foreground text-xs">Across all your visible accounts in {prefCode}</p>
            </CardContent>
          </Card>
        </MotionDiv>

        <MotionDiv variants={slideUp}>
          <SummaryCard
            title="Income"
            value={calculateConvertedTotal(summary?.income)}
            currencyCode={prefCode}
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
            value={calculateConvertedTotal(summary?.expense)}
            currencyCode={prefCode}
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
            <div className="pr-2 max-h-[350px] overflow-x-hidden overflow-y-auto">
              <MotionDiv
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-2"
              >
                {transactions?.data && transactions.data.length > 0 ? (
                  transactions.data.map((transaction) => (
                    <MotionDiv 
                      key={transaction.id} 
                      className="group flex justify-between items-center bg-card hover:bg-muted/50 shadow-sm p-3 border rounded-xl text-card-foreground transition-colors" 
                      variants={slideUp}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div
                          className="flex justify-center items-center rounded-full w-10 h-10 text-white shrink-0"
                          style={{ backgroundColor: transaction.category?.color || '#94a3b8' }}
                        >
                          <IconRenderer name={transaction.category?.icon || 'HelpCircle'} className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-medium group-hover:text-primary text-sm truncate transition-colors">
                            {transaction.description}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="bg-muted px-1.5 py-0.5 rounded font-medium text-[10px] text-muted-foreground truncate">
                              {transaction.category?.name || 'Uncategorized'}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground/60 uppercase shrink-0">
                              {new Date(transaction.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={cn(
                        "ml-2 font-mono font-bold text-right shrink-0",
                        transaction.type === 'INCOME' ? 'text-primary' : 'text-destructive'
                      )}>
                        {transaction.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(parseFloat(transaction.amount), prefCode)}
                      </div>
                    </MotionDiv>
                  ))
                ) : (
                  <div className="bg-card py-12 border rounded-xl text-muted-foreground text-sm text-center italic">
                    No transactions found for this period.
                  </div>
                )}
              </MotionDiv>
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
          currencyCode={prefCode}
        />
        <CategoryDistributionChart
          title="Expense Distribution"
          description="Where your money goes."
          data={summary?.categoryExpense || []}
          loading={summaryLoading}
          currencyCode={prefCode}
        />
      </div>
    </div>
  );
}
