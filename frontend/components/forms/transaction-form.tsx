'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useAccounts } from '@/lib/hooks/use-accounts';
import { useCategories } from '@/lib/hooks/use-categories';
import { useTags, useCreateTag } from '@/lib/hooks/use-tags';
import { useCreateTransaction, useUpdateTransaction } from '@/lib/hooks/use-transactions';
import { Check, Plus } from 'lucide-react';
import {
  transactionFormSchema,
  type TransactionFormValues,
} from '@/lib/validations/transaction';
import { cn } from '@/lib/utils';
import { CategoryForm } from './category-form';
import { IconRenderer } from '../ui/icon-renderer';
import type { Transaction } from '@/lib/api/types';

interface TransactionFormProps {
  type?: 'INCOME' | 'EXPENSE';
  initialData?: Transaction;
  transactionId?: string;
  onSuccess?: () => void;
}

export function TransactionForm({ type: propsType, initialData, transactionId, onSuccess }: TransactionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  const isEditMode = !!transactionId;
  const type = initialData ? initialData.type : propsType || 'EXPENSE'; // Fallback to expense if not provided

  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: tags, isLoading: tagsLoading } = useTags();
  const createTagMutation = useCreateTag();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();

  // Filter categories by transaction type
  const filteredCategories = categories?.filter(c => c.type === type) || [];

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: initialData ? parseFloat(initialData.amount) : '' as any,
      description: initialData?.description || '',
      date: initialData ? new Date(initialData.date) : new Date(),
      accountId: initialData?.accountId || '',
      comments: initialData?.comments || '',
      categoryId: initialData?.categoryId || undefined,
      tagIds: initialData?.tags?.map(t => t.id) || [],
    },
  });
  
  // Reset form when initialData changes (useful when dialog opens/closes with different data)
  useEffect(() => {
    if (initialData) {
      form.reset({
        amount: parseFloat(initialData.amount),
        description: initialData.description,
        date: new Date(initialData.date),
        accountId: initialData.accountId,
        comments: initialData.comments || '',
        categoryId: initialData.categoryId || undefined,
        tagIds: initialData.tags?.map(t => t.id) || [],
      });
    }
  }, [initialData, form]);

  const handleCreateTag = async (name: string) => {
    try {
      const newTag = await createTagMutation.mutateAsync({ 
        name,
        color: '#64748b' // Default slate color
      });
      const currentTags = form.getValues('tagIds') || [];
      form.setValue('tagIds', [...currentTags, newTag.id]);
      setTagSearch('');
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const onCategoryCreated = (categoryId: string) => {
    form.setValue('categoryId', categoryId);
    setIsCategoryDialogOpen(false);
  };

  async function onSubmit(values: TransactionFormValues) {
    setIsSubmitting(true);
    try {
      if (isEditMode && transactionId) {
        await updateTransaction.mutateAsync({
          id: transactionId,
          data: {
            amount: values.amount,
            type,
            date: values.date.toISOString(),
            description: values.description,
            accountId: values.accountId,
            comments: values.comments || undefined,
            categoryId: values.categoryId || undefined,
            tagIds: values.tagIds && values.tagIds.length > 0 ? values.tagIds : undefined,
          }
        });
      } else {
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
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/home');
      }
    } catch (error) {
      console.error('Failed to save transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="top-1/2 left-3 absolute text-muted-foreground -translate-y-1/2">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? '' : parseFloat(value));
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="What is this transaction for?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'pl-3 w-full font-normal text-left',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="opacity-50 ml-auto w-4 h-4" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accountsLoading ? (
                    <div className="flex justify-center items-center p-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : accounts && accounts.length > 0 ? (
                    accounts.map((account: any) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <span
                            className="rounded-full w-3 h-3"
                            style={{ backgroundColor: account.color }}
                          />
                          {account.name}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-muted-foreground text-sm text-center">
                      No accounts found. Please create an account first.
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the account for this transaction
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Category</FormLabel>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm" 
                      className="gap-1 hover:bg-primary/10 px-2 h-7 text-primary hover:text-primary text-xs transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      New Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                    </DialogHeader>
                    <CategoryForm 
                      type={type} 
                      onSuccess={onCategoryCreated}
                      onCancel={() => setIsCategoryDialogOpen(false)} 
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoriesLoading ? (
                    <div className="flex justify-center items-center p-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="flex justify-center items-center rounded-full w-6 h-6 text-white"
                            style={{ backgroundColor: category.color }}
                          >
                            <IconRenderer name={category.icon || 'HelpCircle'} className="w-3.5 h-3.5" />
                          </div>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-muted-foreground text-sm text-center">
                      No categories found for this type.
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tagIds"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tags</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'flex flex-wrap justify-start items-center gap-1 pl-3 w-full h-auto min-h-[40px] font-normal text-left',
                        !field.value?.length && 'text-muted-foreground'
                      )}
                    >
                      {field.value && field.value.length > 0 ? (
                        field.value.map((id) => {
                          const tag = tags?.find((t) => t.id === id);
                          return (
                            <Badge
                              key={id}
                              variant="secondary"
                              className="mr-1 px-2 py-0 h-6 text-xs"
                            >
                              {tag?.name || 'Unknown'}
                            </Badge>
                          );
                        })
                      ) : (
                        <span>Select tags</span>
                      )}
                      <Plus className="opacity-50 ml-auto w-4 h-4 shrink-0" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-(--radix-popover-trigger-width)" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search or create tag..." 
                      value={tagSearch}
                      onValueChange={setTagSearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        <Button
                          variant="ghost"
                          className="justify-start gap-2 w-full"
                          onClick={() => handleCreateTag(tagSearch)}
                          type="button"
                        >
                          <Plus className="w-4 h-4" />
                          Create "{tagSearch}"
                        </Button>
                      </CommandEmpty>
                      <CommandGroup>
                        {tags?.map((tag) => (
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
                              <Check className="w-4 h-4" />
                            </div>
                            <span
                              className="mr-2 rounded-full w-2 h-2"
                              style={{ backgroundColor: tag.color }}
                            />
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

        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comments (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onSuccess) onSuccess();
              else router.push('/home');
            }}
            className="flex-1 dark:hover:text-white cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || accountsLoading}
            className="flex-1 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                {isEditMode ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              isEditMode ? 'Save Changes' : `Add ${type === 'INCOME' ? 'Income' : 'Expense'}`
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
