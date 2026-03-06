'use client';

import { useState, useMemo, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import {
  Calendar as CalendarIcon,
  PlusCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Loader2,
} from 'lucide-react';
import { PaginationState } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import { SummaryCard } from '@/components/dashboard/summary-card';
import { TransactionForm } from '@/components/forms/transaction-form';
import { DataTable } from './data-table';
import { useTransactionColumns } from './columns';
import { DeleteTransactionDialog } from './delete-dialog';
import { TransactionDetailDialog } from './detail-dialog';
import { useTransactions, useDeleteTransaction, useDashboardSummary } from '@/lib/hooks/use-transactions';
import { useDateRange, type DateRangePreset } from '@/lib/hooks/use-date-range';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useUser as useAppUser } from '@/lib/hooks/use-user';
import { Transaction } from '@/lib/api/types';
import { getTransactions } from '@/lib/api/transactions';
import { exportToCSV, exportToJSON, exportToPDF, exportToExcel } from '@/lib/utils/export';

export default function TransactionsPage() {
  const { user } = useUser();
  const { data: userPref } = useAppUser();

  // Date range (shared hook)
  const { preset, setPreset, dateRange, setCustomRange, filters: dateFilters } = useDateRange('month');

  // Pagination & type filter
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  // Dialog state
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  
  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Queries
  const filters = useMemo(() => ({
    ...dateFilters,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
  }), [dateFilters, pagination, typeFilter]);

  const { data: transactionsData, isLoading: isTransactionsLoading } = useTransactions(filters);
  const { data: summaryData, isLoading: isSummaryLoading } = useDashboardSummary(dateFilters);
  const deleteTransaction = useDeleteTransaction();

  // Handlers
  const handleEdit = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
  }, []);

  const handleDelete = async () => {
    if (deletingTransactionId) {
      try {
        await deleteTransaction.mutateAsync(deletingTransactionId);
      } catch (error) {
        console.error('Failed to delete transaction', error);
      } finally {
        setDeletingTransactionId(null);
      }
    }
  };

  const handlePresetChange = (newPreset: DateRangePreset) => {
    setPreset(newPreset);
  };

  const handleExport = async (format: 'csv' | 'json' | 'pdf' | 'excel') => {
    setIsExporting(true);
    try {
      const exportFilters = {
        ...dateFilters,
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        limit: 10000,
        page: 1,
      };
      const response = await getTransactions(exportFilters);
      const data = response.data;
      
      switch (format) {
        case 'csv':
          exportToCSV(data);
          break;
        case 'json':
          exportToJSON(data);
          break;
        case 'pdf':
          exportToPDF(data);
          break;
        case 'excel':
          exportToExcel(data);
          break;
      }
    } catch (error) {
      console.error('Failed to export transactions', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Columns (extracted to separate file)
  const columns = useTransactionColumns({
    onEdit: handleEdit,
    onDelete: setDeletingTransactionId,
  });

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header />
      <main className="mx-auto px-4 pt-24 pb-12 max-w-7xl container">

        {/* Page Header */}
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-bold text-3xl tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">Manage and track your financial activity.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button className="flex-1 sm:flex-none gap-2 w-full sm:w-auto" asChild>
              <Link href="/transactions/income">
                <PlusCircle className="w-4 h-4" /> Income
              </Link>
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none gap-2 w-full sm:w-auto" asChild>
              <Link href="/transactions/expense">
                <PlusCircle className="w-4 h-4" /> Expense
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Summary Cards */}
          <div className="gap-4 order-3 md:order-1 grid grid-cols-1 md:grid-cols-3">
            <SummaryCard
              title="Total Income"
              value={summaryData?.income}
              icon={ArrowUpCircle}
              variant="income"
              isLoading={isSummaryLoading}
              currencyCode={userPref?.preferredCurrencyCode || undefined}
            />
            <SummaryCard
              title="Total Expenses"
              value={summaryData?.expense}
              icon={ArrowDownCircle}
              variant="expense"
              isLoading={isSummaryLoading}
              currencyCode={userPref?.preferredCurrencyCode || undefined}
            />
            <SummaryCard
              title="Net Balance"
              value={(summaryData?.income || 0) - (summaryData?.expense || 0)}
              icon={Wallet}
              variant="balance"
              isLoading={isSummaryLoading}
              currencyCode={userPref?.preferredCurrencyCode || undefined}
            />
          </div>

          {/* Filters and Table */}
          <div className="flex flex-col gap-6 order-1 md:order-2">
            {/* Filters */}
            <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-6 bg-card p-4 border rounded-xl">
              <div className="flex sm:flex-row flex-col items-start sm:items-center gap-4 w-full md:w-auto">
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={preset} onValueChange={(val: DateRangePreset) => handlePresetChange(val)}>
                    <SelectTrigger className="w-full md:w-[140px]">
                      <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline"
                    className="h-9"
                    onClick={() => {
                      const now = new Date();
                      setCustomRange({
                        from: startOfMonth(subMonths(now, 1)),
                        to: endOfMonth(subMonths(now, 1)),
                      });
                    }}
                  >
                    Previous Month
                  </Button>

                  <Button 
                    variant="outline"
                    className="h-9"
                    onClick={() => {
                      const now = new Date();
                      setCustomRange({
                        from: startOfMonth(subMonths(now, 2)),
                        to: endOfMonth(now),
                      });
                    }}
                  >
                    Last 3 Months
                  </Button>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start w-full md:w-[240px] font-normal text-left",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 w-4 h-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-auto" align="start">
                      <Calendar
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(range) => {
                          if (range?.from && range?.to) {
                            setCustomRange({ from: range.from, to: range.to });
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-muted/50 p-1.5 border rounded-lg w-full md:w-auto">
                <RadioGroup
                  value={typeFilter}
                  onValueChange={(val: 'ALL' | 'INCOME' | 'EXPENSE') => {
                    setTypeFilter(val);
                    setPagination(prev => ({ ...prev, pageIndex: 0 }));
                  }}
                  className="flex items-center gap-0 w-full md:w-auto"
                >
                  {([
                    { value: 'ALL', label: 'All', activeClass: 'text-primary' },
                    { value: 'INCOME', label: 'Income', activeClass: 'text-emerald-600' },
                    { value: 'EXPENSE', label: 'Expense', activeClass: 'text-red-600' },
                  ] as const).map(({ value, label, activeClass }) => (
                    <div key={value} className="flex-1">
                      <RadioGroupItem value={value} id={value.toLowerCase()} className="sr-only" />
                      <Label
                        htmlFor={value.toLowerCase()}
                        className={cn(
                          "flex justify-center items-center px-4 py-1.5 rounded-md text-sm whitespace-nowrap transition-all cursor-pointer",
                          typeFilter === value
                            ? `bg-background shadow-sm ${activeClass} font-bold`
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Data Table */}
            <DataTable
              columns={columns}
              data={transactionsData?.data || []}
              pageCount={transactionsData?.meta.totalPages || 0}
              pagination={pagination}
              onPaginationChange={setPagination}
              isLoading={isTransactionsLoading}
              onRowClick={setViewingTransaction}
              renderBottomLeft={
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isExporting}>
                      {isExporting ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Download className="mr-2 w-4 h-4" />}
                      Export data
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-2 w-40" align="start">
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="sm" className="justify-start" onClick={() => handleExport('pdf')}>
                        <FileText className="mr-2 w-4 h-4" /> PDF
                      </Button>
                      <Button variant="ghost" size="sm" className="justify-start" onClick={() => handleExport('excel')}>
                        <FileSpreadsheet className="mr-2 w-4 h-4 text-green-600" /> Excel
                      </Button>
                      <Button variant="ghost" size="sm" className="justify-start" onClick={() => handleExport('csv')}>
                        <FileSpreadsheet className="mr-2 w-4 h-4" /> CSV
                      </Button>
                      <Button variant="ghost" size="sm" className="justify-start" onClick={() => handleExport('json')}>
                        <FileJson className="mr-2 w-4 h-4" /> JSON
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              }
            />
          </div>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update transaction details.</DialogDescription>
          </DialogHeader>
          <TransactionForm
            initialData={editingTransaction || undefined}
            transactionId={editingTransaction?.id}
            onSuccess={() => setEditingTransaction(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteTransactionDialog
        open={!!deletingTransactionId}
        onOpenChange={(open) => !open && setDeletingTransactionId(null)}
        onConfirm={handleDelete}
        isPending={deleteTransaction.isPending}
      />

      {/* View Details Dialog */}
      <TransactionDetailDialog
        transaction={viewingTransaction}
        open={!!viewingTransaction}
        onOpenChange={(open) => !open && setViewingTransaction(null)}
        onEdit={handleEdit}
        onDelete={setDeletingTransactionId}
      />

      <Footer />
    </div>
  );
}
