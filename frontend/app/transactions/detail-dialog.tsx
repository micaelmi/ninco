'use client';

import { format } from 'date-fns';
import { Edit, Trash, Tag as TagIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency, cn } from '@/lib/utils';
import { Transaction } from '@/lib/api/types';
import { useUser } from '@/lib/hooks/use-user';

interface TransactionDetailDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionDetailDialog({
  transaction,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: TransactionDetailDialogProps) {
  const { data: userPref } = useUser();
  const prefCode = userPref?.preferredCurrencyCode || 'USD';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        {transaction && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-mono text-muted-foreground text-sm">
                  {format(new Date(transaction.date), "PPP")}
                </div>
                <h3 className="font-bold text-lg">{transaction.description}</h3>
              </div>
              <div className={cn(
                "font-mono font-bold text-xl",
                transaction.type === 'INCOME' ? "text-emerald-600" : "text-red-600"
              )}>
                {transaction.type === 'INCOME' ? '+' : '-'}
                {formatCurrency(parseFloat(transaction.amount), prefCode)}
              </div>
            </div>

            <div className="gap-2 grid grid-cols-2">
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs uppercase">Category</span>
                <div className="flex items-center gap-2">
                  <div
                    className="rounded-full w-3 h-3"
                    style={{ backgroundColor: transaction.category?.color || '#94a3b8' }}
                  />
                  <span>{transaction.category?.name || 'Uncategorized'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs uppercase">Account</span>
                <div>{transaction.account.name}</div>
              </div>
            </div>

            {transaction.comments && (
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs uppercase">Comments</span>
                <p className="bg-muted p-2 rounded-md text-sm">{transaction.comments}</p>
              </div>
            )}

            {transaction.tags && transaction.tags.length > 0 && (
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs uppercase">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {transaction.tags.map(tag => (
                    <Badge key={tag.id} variant="secondary" className="gap-1 font-normal">
                      <TagIcon className="w-3 h-3" />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={() => {
                onOpenChange(false);
                onEdit(transaction);
              }}>
                <Edit className="mr-2 w-3 h-3" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => {
                onOpenChange(false);
                onDelete(transaction.id);
              }}>
                <Trash className="mr-2 w-3 h-3" /> Delete
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
