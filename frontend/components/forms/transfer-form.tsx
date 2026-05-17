'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';
import { z } from 'zod';
import { subDays } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { CustomFormInput } from '@/components/ui/custom-form-input';
import { CustomFormSelect } from '@/components/ui/custom-form-select';
import { CustomFormDatePicker } from '@/components/ui/custom-form-date-picker';
import { useAccounts } from '@/lib/hooks/use-accounts';
import { useCreateTransfer } from '@/lib/hooks/use-transactions';

const transferFormSchema = z.object({
  fromAccountId: z.string().uuid('Please select a source account'),
  toAccountId: z.string().uuid('Please select a destination account'),
  amountFrom: z
    .number({ message: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .max(999999999, 'Amount is too large'),
  amountTo: z
    .number({ message: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .max(999999999, 'Amount is too large'),
  date: z.date({ message: 'Date is required' }),
  description: z.string().max(255, 'Description is too long').optional(),
}).refine(data => data.fromAccountId !== data.toAccountId, {
  message: 'Source and destination accounts must be different',
  path: ['toAccountId'],
});

type TransferFormValues = z.infer<typeof transferFormSchema>;

interface TransferFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransferForm({ onSuccess, onCancel }: TransferFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const createTransfer = useCreateTransfer();

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      fromAccountId: '',
      toAccountId: '',
      amountFrom: '' as any,
      amountTo: '' as any,
      date: new Date(),
      description: '',
    },
  });

  const fromAccountId = form.watch('fromAccountId');
  const toAccountId = form.watch('toAccountId');

  const fromAccount = accounts?.find(a => a.id === fromAccountId);
  const toAccount = accounts?.find(a => a.id === toAccountId);

  // Determine if currencies differ
  const fromCurrency = fromAccount?.currencyCode || 'USD';
  const toCurrency = toAccount?.currencyCode || 'USD';
  const isDifferentCurrency = fromAccountId && toAccountId && fromCurrency !== toCurrency;

  // Sync amountTo to amountFrom when same currency
  const amountFrom = form.watch('amountFrom');
  if (!isDifferentCurrency && amountFrom && form.getValues('amountTo') !== amountFrom) {
    form.setValue('amountTo', amountFrom, { shouldValidate: false });
  }

  async function onSubmit(values: TransferFormValues) {
    setIsSubmitting(true);
    try {
      await createTransfer.mutateAsync({
        fromAccountId: values.fromAccountId,
        toAccountId: values.toAccountId,
        amountFrom: values.amountFrom,
        amountTo: isDifferentCurrency ? values.amountTo : values.amountFrom,
        date: values.date.toISOString(),
        description: values.description || undefined,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create transfer:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const accountOptions = accounts?.map(account => ({
    value: account.id,
    label: (
      <div className="flex items-center gap-2">
        <span
          className="rounded-full w-3 h-3"
          style={{ backgroundColor: account.color }}
        />
        <span>{account.name}</span>
        {account.currencyCode && (
          <span className="text-muted-foreground text-xs">({account.currencyCode})</span>
        )}
      </div>
    ),
  })) || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* From Account */}
        <CustomFormSelect
          control={form.control}
          name="fromAccountId"
          label="From Account"
          placeholder="Select source account"
          isLoading={accountsLoading}
          emptyMessage="No accounts found."
          description={fromAccount ? `Balance: ${fromCurrency} ${parseFloat(fromAccount.balance).toLocaleString()}` : undefined}
          options={accountOptions}
        />

        {/* Arrow indicator */}
        <div className="flex justify-center">
          <div className="flex justify-center items-center bg-muted rounded-full w-8 h-8">
            <ArrowDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* To Account */}
        <CustomFormSelect
          control={form.control}
          name="toAccountId"
          label="To Account"
          placeholder="Select destination account"
          isLoading={accountsLoading}
          emptyMessage="No accounts found."
          description={toAccount ? `Balance: ${toCurrency} ${parseFloat(toAccount.balance).toLocaleString()}` : undefined}
          options={accountOptions}
        />

        {/* Amount From */}
        <CustomFormInput
          control={form.control}
          name="amountFrom"
          label={isDifferentCurrency ? `Amount Sent (${fromCurrency})` : 'Amount'}
          placeholder="0.00"
          type="number"
          step="0.01"
          startIcon={<span className="text-sm">{fromCurrency === 'USD' ? '$' : fromCurrency}</span>}
        />

        {/* Amount To — only shown when currencies differ */}
        {isDifferentCurrency && (
          <CustomFormInput
            control={form.control}
            name="amountTo"
            label={`Amount Received (${toCurrency})`}
            placeholder="0.00"
            type="number"
            step="0.01"
            description={`The amount that arrived in ${toAccount?.name || 'the destination account'}`}
            startIcon={<span className="text-sm">{toCurrency === 'USD' ? '$' : toCurrency}</span>}
          />
        )}

        {/* Date */}
        <div className="space-y-2">
          <CustomFormDatePicker
            control={form.control}
            name="date"
            label="Date"
            disabled={(date) =>
              date > new Date() || date < new Date('1900-01-01')
            }
          />
          <div className="flex flex-wrap gap-2 text-xs">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="px-2 py-1 h-7 text-xs"
              onClick={() => form.setValue('date', new Date())}
            >
              Today
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="px-2 py-1 h-7 text-xs"
              onClick={() => form.setValue('date', subDays(new Date(), 1))}
            >
              Yesterday
            </Button>
          </div>
        </div>

        {/* Description (optional) */}
        <CustomFormInput
          control={form.control}
          name="description"
          label="Description (Optional)"
          placeholder="e.g. Savings deposit, Currency exchange..."
        />

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || accountsLoading}
            className="flex-1 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Transferring...
              </>
            ) : (
              'Transfer'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
