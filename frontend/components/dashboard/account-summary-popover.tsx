'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, Info, Pencil, PlusCircle, EyeOff } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { AccountForm } from '@/components/forms/account-form';
import { cn } from '@/lib/utils';

interface AccountSummary {
  id: string;
  name: string;
  balance: number;
  color: string;
  icon?: string;
  currencyCode?: string | null;
  isVisible: boolean;
}

interface AccountSummaryPopoverProps {
  accounts: AccountSummary[];
  trigger?: React.ReactNode;
}

export function AccountSummaryPopover({ accounts, trigger }: AccountSummaryPopoverProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'list' | 'edit' | 'create'>('list');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  const editingAccount = accounts.find((a) => a.id === editingAccountId);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Small delay to prevent UI flicker while closing
      setTimeout(() => {
        setView('list');
        setEditingAccountId(null);
      }, 300);
    }
  };

  const resetView = () => {
    setView('list');
    setEditingAccountId(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="rounded-full w-5 h-5 cursor-pointer">
            <PlusCircle className="w-4 h-4 text-muted-foreground" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {view === 'edit' && editingAccountId && editingAccount ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div
                  className="rounded-full w-3 h-3"
                  style={{ backgroundColor: editingAccount.color }}
                />
                Edit {editingAccount.name}
              </DialogTitle>
            </DialogHeader>
            <AccountForm
              accountId={editingAccountId}
              initialData={{
                name: editingAccount.name,
                balance: editingAccount.balance,
                color: editingAccount.color,
                icon: editingAccount.icon || 'Wallet',
                currencyCode: editingAccount.currencyCode || undefined,
              }}
              onSuccess={resetView}
              onCancel={resetView}
            />
          </>
        ) : view === 'create' ? (
          <>
             <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Create New Account
              </DialogTitle>
            </DialogHeader>
            <AccountForm
              onSuccess={resetView}
              onCancel={resetView}
            />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Account Balances
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-1 mt-2">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="group flex justify-between items-center gap-3 hover:bg-muted/50 p-3 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex justify-center items-center rounded-lg w-9 h-9"
                      style={{ backgroundColor: account.color + '20' }}
                    >
                      <IconRenderer
                        name={account.icon || 'Wallet'}
                        className="w-4 h-4"
                        style={{ color: account.color }}
                      />
                    </div>
                    <span className="font-medium text-sm">{account.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-mono font-bold text-sm",
                      account.balance >= 0 ? "text-emerald-600" : "text-red-500",
                      account.isVisible === false && "opacity-60"
                    )}>
                      {formatCurrency(account.balance, account.currencyCode)}
                    </span>
                    {account.isVisible === false && (
                      <EyeOff className="w-3.5 h-3.5 text-muted-foreground" aria-label="Hidden from dashboard" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                      onClick={() => {
                        setEditingAccountId(account.id);
                        setView('edit');
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {accounts.length === 0 && (
                <p className="py-6 text-muted-foreground text-sm text-center">
                  No accounts found.
                </p>
              )}
              
              <Button 
                className="mt-4 w-full" 
                variant="outline" 
                onClick={() => setView('create')}
              >
                + Add New Account
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
