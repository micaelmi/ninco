'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { subDays } from 'date-fns';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { CustomFormInput } from '@/components/ui/custom-form-input';
import { CustomFormTextarea } from '@/components/ui/custom-form-textarea';
import { CustomFormSelect } from '@/components/ui/custom-form-select';
import { CustomFormDatePicker } from '@/components/ui/custom-form-date-picker';
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
        description: initialData.description || '',
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
        <CustomFormInput
          control={form.control}
          name="amount"
          label="Amount"
          placeholder="0.00"
          type="number"
          step="0.01"
          startIcon={<span className="text-sm">$</span>}
        />

        <CustomFormInput
          control={form.control}
          name="description"
          label="Description"
          placeholder="What is this transaction for?"
        />

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
              onClick={() => form.setValue('date', subDays(new Date(), 1))}
            >
              Yesterday
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="px-2 py-1 h-7 text-xs"
              onClick={() => form.setValue('date', subDays(new Date(), 2))}
            >
              2 days ago
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="px-2 py-1 h-7 text-xs"
              onClick={() => form.setValue('date', subDays(new Date(), 3))}
            >
              3 days ago
            </Button>
          </div>
        </div>

        {(() => {
          const selectedAccountId = form.watch('accountId');
          const selectedAccount = accounts?.find((a: any) => a.id === selectedAccountId);
          
          let descriptionText = "Select the account for this transaction";
          
          if (selectedAccount?.currencyCode) {
            if (type === 'INCOME') {
              descriptionText = `Amount added in ${selectedAccount.currencyCode}`;
            } else if (type === 'EXPENSE') {
              descriptionText = `Amount deducted in ${selectedAccount.currencyCode}`;
            }
          }

          return (
            <CustomFormSelect
              control={form.control}
              name="accountId"
              label="Account"
              placeholder="Select an account"
              description={descriptionText}
              isLoading={accountsLoading}
              emptyMessage="No accounts found. Please create an account first."
              options={accounts?.map((account: any) => ({
                value: account.id,
                label: (
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full w-3 h-3"
                      style={{ backgroundColor: account.color }}
                    />
                    {account.name}
                  </div>
                ),
              })) || []}
            />
          );
        })()}

        <div className="space-y-2">
          <CustomFormSelect
            control={form.control}
            name="categoryId"
            label="Category"
            placeholder="Select a category"
            isLoading={categoriesLoading}
            emptyMessage="No categories found for this type."
            headerContent={
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
            }
            options={filteredCategories.map((category) => ({
              value: category.id,
              label: (
                <div className="flex items-center gap-2">
                  <div 
                    className="flex justify-center items-center rounded-full w-6 h-6 text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    <IconRenderer name={category.icon || 'HelpCircle'} className="w-3.5 h-3.5 text-white" />
                  </div>
                  {category.name}
                </div>
              ),
            }))}
            className="mt-0" 
          />
        </div>

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

        <div className="flex justify-end mt-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="link" size="sm" className="p-0 h-auto text-muted-foreground hover:text-primary text-xs">
                Manage categories and tags
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Leave this page?</AlertDialogTitle>
                <AlertDialogDescription>
                  Any unsaved changes in this form will be lost if you navigate to the management page.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => router.push('/manage')}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <CustomFormTextarea
          control={form.control}
          name="comments"
          label="Comments (Optional)"
          placeholder="Add any additional notes..."
          rows={3}
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
