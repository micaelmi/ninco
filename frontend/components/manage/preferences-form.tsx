'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
} from '@/components/ui/form';
import { useCurrencies } from '@/lib/hooks/use-currencies';
import { useAccounts } from '@/lib/hooks/use-accounts';
import { useUser, useUpdateUser } from '@/lib/hooks/use-user';
import { CustomFormSelect } from '@/components/ui/custom-form-select';

const preferencesFormSchema = z.object({
  preferredCurrencyCode: z.string().min(1, 'Please select a currency'),
  defaultAccountId: z.string().nullable().optional(),
  defaultPeriod: z.string().nullable().optional(),
});

type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;

export function PreferencesForm() {
  const { data: userPref, isLoading: userLoading } = useUser();
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const updateUser = useUpdateUser();

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    values: {
      preferredCurrencyCode: userPref?.preferredCurrencyCode || 'USD',
      defaultAccountId: userPref?.defaultAccountId || 'none',
      defaultPeriod: userPref?.defaultPeriod || 'week',
    },
  });

  const currencyOptions = currencies?.map(c => ({
    label: `${c.code} - ${c.name} (${c.symbol})`,
    value: c.code,
  })) || [];

  const accountOptions = [
    { label: 'No default account', value: 'none' },
    ...(accounts?.map(a => ({
      label: a.name,
      value: a.id,
    })) || [])
  ];

  const periodOptions = [
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
  ];

  const isLoading = updateUser.isPending || userLoading;

  async function onSubmit(values: PreferencesFormValues) {
    try {
      const payloadAccountId = values.defaultAccountId === 'none' ? null : values.defaultAccountId;

      if (
        values.preferredCurrencyCode === userPref?.preferredCurrencyCode &&
        payloadAccountId === userPref?.defaultAccountId &&
        values.defaultPeriod === userPref?.defaultPeriod
      ) {
        toast.info("No changes made to preferences.");
        return;
      }
      
      await updateUser.mutateAsync({
        preferredCurrencyCode: values.preferredCurrencyCode,
        defaultAccountId: payloadAccountId,
        defaultPeriod: values.defaultPeriod,
      });
      toast.success("Preferences updated successfully!");
    } catch (error) {
      toast.error("Failed to update preferences.");
    }
  }

  if (userLoading || currenciesLoading || accountsLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
        <div className="flex flex-col gap-4">
          <CustomFormSelect
            control={form.control}
            name="preferredCurrencyCode"
            label="Preferred Currency"
            placeholder="Select a currency"
            options={currencyOptions}
            isLoading={currenciesLoading}
          />
          <CustomFormSelect
            control={form.control}
            name="defaultAccountId"
            label="Default Account"
            placeholder="Select a default account"
            options={accountOptions}
            isLoading={accountsLoading}
          />
          <CustomFormSelect
            control={form.control}
            name="defaultPeriod"
            label="Default Period"
            placeholder="Select a default period"
            options={periodOptions}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
