'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import {
  MoreHorizontal,
  Trash,
  Edit,
  MessageSquare,
  Tag as TagIcon,
} from 'lucide-react';
import { ColumnDef as TableColumnDef, Row } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { Transaction } from '@/lib/api/types';
import { useUser } from '@/lib/hooks/use-user';

interface UseTransactionColumnsOptions {
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function useTransactionColumns({ onEdit, onDelete }: UseTransactionColumnsOptions) {
  const { data: userPref } = useUser();
  const prefCode = userPref?.preferredCurrencyCode || 'USD';

  return useMemo<TableColumnDef<Transaction>[]>(() => [
    {
      accessorKey: "amount",
      header: () => <div className="pl-4">Amount</div>,
      cell: ({ row }: { row: Row<Transaction> }) => {
        const amount = parseFloat(row.getValue("amount"));
        const type = row.original.type;
        return (
          <div className={cn(
            "pl-4 font-mono font-bold text-base whitespace-nowrap",
            type === 'INCOME' ? "text-emerald-600" : "text-red-600"
          )}>
            {type === 'INCOME' ? '+' : '-'}{formatCurrency(amount, prefCode)}
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }: { row: Row<Transaction> }) => (
        <div className="font-medium text-sm whitespace-nowrap">
          {format(new Date(row.getValue("date")), "MMM dd, yyyy")}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: { row: Row<Transaction> }) => {
        const category = row.original.category;
        const tags = row.original.tags || [];
        const comments = row.original.comments;
        const date = new Date(row.getValue("date"));
        const accountName = row.original.account.name;

        return (
          <div className="flex flex-col gap-1 min-w-[150px]">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{row.getValue("description")}</span>
              {comments && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <MessageSquare className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{comments}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Mobile Metadata */}
            <div className="md:hidden flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
              <span>{format(date, "MMM dd")}</span>
              <span>•</span>
              <span>{accountName}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <div className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-sm text-[10px] text-muted-foreground">
                  <div
                    className="rounded-full w-2 h-2"
                    style={{ backgroundColor: category.color || '#94a3b8' }}
                  />
                  <span>{category.name}</span>
                </div>
              )}
              {tags.map(tag => (
                <div key={tag.id} className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-sm text-[10px] text-muted-foreground">
                  <TagIcon className="w-2 h-2" />
                  {tag.name}
                </div>
              ))}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "account",
      header: "Account",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }: { row: Row<Transaction> }) => (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">{row.original.account.name}</span>
        </div>
      ),
    },
    {
      id: "actions",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }: { row: Row<Transaction> }) => {
        const transaction = row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 w-8 h-8">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(transaction)}>
                  <Edit className="mr-2 w-4 h-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(transaction.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash className="mr-2 w-4 h-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [onEdit, onDelete, prefCode]);
}
