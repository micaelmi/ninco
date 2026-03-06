'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Check, RotateCcw, Loader2, CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subDays } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check as CheckIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { useAccounts } from '@/lib/hooks/use-accounts';
import { useCategories } from '@/lib/hooks/use-categories';
import { useTags } from '@/lib/hooks/use-tags';
import { useCreateTransaction } from '@/lib/hooks/use-transactions';
import { transactionFormSchema, type TransactionFormValues } from '@/lib/validations/transaction';
import type { AiTransactionResult } from '@/lib/ai/gemini';
import { toast } from 'sonner';

interface AiTransactionPreviewProps {
  result: AiTransactionResult;
  onReset: () => void;
  onSuccess: () => void;
}

export function AiTransactionPreview({ result, onReset, onSuccess }: AiTransactionPreviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: categories } = useCategories();
  const { data: tags } = useTags();
  const createTransaction = useCreateTransaction();

  const type = result.type;
  const filteredCategories = categories?.filter((c: any) => c.type === type) || [];

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: result.amount || ('' as any),
      description: result.description || '',
      date: result.date || new Date(),
      accountId: result.accountId || '',
      comments: result.comments || '',
      categoryId: result.categoryId || undefined,
      tagIds: result.tagIds || [],
    },
  });

  // Re-populate if result changes
  useEffect(() => {
    form.reset({
      amount: result.amount || ('' as any),
      description: result.description || '',
      date: result.date || new Date(),
      accountId: result.accountId || '',
      comments: result.comments || '',
      categoryId: result.categoryId || undefined,
      tagIds: result.tagIds || [],
    });
  }, [result]);

  const onSubmit = async (values: TransactionFormValues) => {
    setIsSubmitting(true);
    try {
      await createTransaction.mutateAsync({
        amount: values.amount,
        type,
        date: values.date.toISOString(),
        description: values.description,
        accountId: values.accountId,
        comments: values.comments || undefined,
        categoryId: values.categoryId || undefined,
        tagIds: values.tagIds && values.tagIds.length > 0 ? values.tagIds : undefined,
      });
      toast.success('Transaction created!');
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeBadgeClass = type === 'INCOME'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

  return (
    <div className="bg-muted/30 border border-border rounded-xl overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-muted/50 px-3 py-2 border-border border-b">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">✨ Transaction Preview</span>
          <span className={cn('px-2 py-0.5 rounded-full font-semibold text-xs', typeBadgeClass)}>
            {type}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="gap-1 h-7 text-muted-foreground hover:text-foreground text-xs"
        >
          <RotateCcw className="w-3 h-3" />
          Try again
        </Button>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 p-3">
          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="top-1/2 left-3 absolute text-muted-foreground text-sm -translate-y-1/2">$</span>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      className="pl-7 h-9 text-sm"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || '')}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Description</FormLabel>
                <FormControl>
                  <Input {...field} className="h-9 text-sm" placeholder="What is this for?" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'justify-start w-full h-9 font-normal text-sm',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 w-3.5 h-3.5" />
                        {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                      initialFocus
                    />
                    <div className="flex flex-wrap gap-1 p-2 border-t">
                      {[
                        { label: 'Today', fn: () => new Date() },
                        { label: 'Yesterday', fn: () => subDays(new Date(), 1) },
                        { label: '2 days ago', fn: () => subDays(new Date(), 2) },
                      ].map(({ label, fn }) => (
                        <Button
                          key={label}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="px-2 h-6 text-xs"
                          onClick={() => field.onChange(fn())}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Account */}
          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Account</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={accountsLoading}>
                  <FormControl>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts?.map((account: any) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <span
                            className="rounded-full w-2.5 h-2.5"
                            style={{ backgroundColor: account.color }}
                          />
                          {account.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Category</FormLabel>
                <Select value={field.value || ''} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select category (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredCategories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="flex justify-center items-center rounded-full w-5 h-5"
                            style={{ backgroundColor: cat.color }}
                          >
                            <IconRenderer name={cat.icon || 'HelpCircle'} className="w-3 h-3 text-white" />
                          </div>
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tags */}
          <FormField
            control={form.control}
            name="tagIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Tags</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'flex flex-wrap justify-start items-center gap-1 pl-3 w-full h-auto min-h-[36px] font-normal text-sm text-left',
                          !field.value?.length && 'text-muted-foreground'
                        )}
                      >
                        {field.value?.length ? (
                          field.value.map((id) => {
                            const tag = tags?.find((t: any) => t.id === id);
                            return (
                              <Badge key={id} variant="secondary" className="px-1.5 py-0 h-5 text-xs">
                                {tag?.name || 'Unknown'}
                              </Badge>
                            );
                          })
                        ) : (
                          <span>Select tags (optional)</span>
                        )}
                        <Plus className="opacity-50 ml-auto w-3.5 h-3.5 shrink-0" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-(--radix-popover-trigger-width)" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search tags..."
                        value={tagSearch}
                        onValueChange={setTagSearch}
                      />
                      <CommandList>
                        <CommandEmpty>No tags found.</CommandEmpty>
                        <CommandGroup>
                          {tags?.map((tag: any) => (
                            <CommandItem
                              key={tag.id}
                              onSelect={() => {
                                const current = field.value || [];
                                const next = current.includes(tag.id)
                                  ? current.filter((id) => id !== tag.id)
                                  : [...current, tag.id];
                                field.onChange(next);
                              }}
                            >
                              <div
                                className={cn(
                                  'flex justify-center items-center mr-2 border border-primary rounded-sm w-4 h-4',
                                  field.value?.includes(tag.id)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'opacity-50 [&_svg]:invisible'
                                )}
                              >
                                <CheckIcon className="w-4 h-4" />
                              </div>
                              {tag.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actions */}
          <Button
            type="submit"
            disabled={isSubmitting || accountsLoading}
            className="gap-2 bg-linear-to-r from-emerald-500 hover:from-emerald-600 to-teal-600 hover:to-teal-700 border-0 w-full text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirm & Create Transaction
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
