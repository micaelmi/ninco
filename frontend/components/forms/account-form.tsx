'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, Check, Search } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useUpdateAccount, useCreateAccount } from '@/lib/hooks/use-accounts';
import { useCurrencies } from '@/lib/hooks/use-currencies';
import { useUser } from '@/lib/hooks/use-user';
import { IconRenderer, CATEGORY_ICONS, CATEGORY_COLORS } from '@/components/ui/icon-renderer';
import { CustomFormSelect } from '@/components/ui/custom-form-select';
import { CustomFormInput } from '@/components/ui/custom-form-input';
import { cn } from '@/lib/utils';

const accountFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  balance: z.number(),
  color: z.string().min(1),
  icon: z.string().min(1),
  currencyCode: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

interface AccountFormProps {
  accountId?: string; // Optional for creation mode
  initialData?: {
    name: string;
    balance: number;
    color: string;
    icon: string;
    currencyCode?: string | null;
  };
  onSuccess?: () => void;
  onCancel: () => void;
}

export function AccountForm({ accountId, initialData, onSuccess, onCancel }: AccountFormProps) {
  const [iconSearch, setIconSearch] = useState('');
  const updateAccount = useUpdateAccount();
  const createAccount = useCreateAccount();

  const { data: currencies, isLoading: currenciesLoading } = useCurrencies();
  const { data: userPref } = useUser();

  const isEditing = !!accountId;
  const isLoading = updateAccount.isPending || createAccount.isPending;

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      balance: initialData?.balance || 0,
      color: initialData?.color || CATEGORY_COLORS[0].value,
      icon: initialData?.icon || 'Wallet',
      currencyCode: initialData?.currencyCode || userPref?.preferredCurrencyCode || 'USD',
    },
  });

  const currencyOptions = currencies?.map(c => ({
    label: `${c.code} - ${c.name} (${c.symbol})`,
    value: c.code,
  })) || [];

  const filteredIcons = CATEGORY_ICONS.filter((icon) =>
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  async function onSubmit(values: AccountFormValues) {
    try {
      const roundedValues = {
        ...values,
        balance: Number(values.balance.toFixed(2)),
      };

      if (isEditing && accountId) {
        await updateAccount.mutateAsync({
          id: accountId,
          data: roundedValues,
        });
      } else {
        await createAccount.mutateAsync(roundedValues);
      }
      onSuccess?.();
    } catch (error) {
      // toast handled by the hook
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CustomFormInput
          control={form.control}
          name="name"
          label="Account Name"
          placeholder="e.g. Main Account, Savings..."
        />

        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Balance</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="top-1/2 left-3 absolute font-mono text-muted-foreground text-sm -translate-y-1/2">$</span>
                  <input
                    type="number"
                    step="0.01"
                    className="bg-background px-3 py-2 pl-7 border border-input rounded-md outline-none focus:ring-1 focus:ring-ring w-full font-mono text-sm"
                    value={field.value}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <CustomFormSelect
          control={form.control}
          name="currencyCode"
          label="Currency"
          placeholder="Select a currency"
          options={currencyOptions}
          isLoading={currenciesLoading}
        />

        {/* Color Picker — reused from category form */}
        <div className="space-y-3">
          <FormLabel>Color</FormLabel>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                className={cn(
                  "flex justify-center items-center border-2 rounded-full w-8 h-8 transition-all cursor-pointer",
                  form.watch('color') === color.value 
                    ? "border-primary scale-110 shadow-md" 
                    : "border-transparent hover:scale-105"
                )}
                style={{ backgroundColor: color.value }}
                onClick={() => form.setValue('color', color.value)}
                title={color.name}
              >
                {form.watch('color') === color.value && (
                  <Check className="drop-shadow-sm w-4 h-4 text-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Icon Picker — reused from category form */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <FormLabel>Icon</FormLabel>
            <div className="relative">
              <Search className="top-1/2 left-2 absolute w-3 h-3 text-muted-foreground -translate-y-1/2" />
              <input
                className="bg-transparent px-7 py-1 border border-input rounded-md outline-none focus:ring-1 focus:ring-ring w-32 h-7 text-xs"
                placeholder="Search icon..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="gap-2 grid grid-cols-6 bg-card p-2 border rounded-md max-h-[160px] overflow-y-auto">
            {filteredIcons.map((iconName) => (
              <button
                key={iconName}
                type="button"
                className={cn(
                  "flex justify-center items-center p-2 border rounded-md transition-all cursor-pointer",
                  form.watch('icon') === iconName
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-transparent hover:border-input"
                )}
                onClick={() => form.setValue('icon', iconName)}
              >
                <IconRenderer name={iconName} className="w-5 h-5" />
              </button>
            ))}
            {filteredIcons.length === 0 && (
              <div className="col-span-6 py-4 text-muted-foreground text-xs text-center">
                No icons found.
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                {isEditing ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Create Account'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
