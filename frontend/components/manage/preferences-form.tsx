'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
} from '@/components/ui/form';
import { useCurrencies } from '@/lib/hooks/use-currencies';
import { useUser, useUpdateUser } from '@/lib/hooks/use-user';
import { CustomFormSelect } from '@/components/ui/custom-form-select';

const preferencesFormSchema = z.object({
  preferredCurrencyCode: z.string().min(1, 'Please select a currency'),
});

type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;

export function PreferencesForm() {
  const { data: userPref, isLoading: userLoading } = useUser();
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies();
  const updateUser = useUpdateUser();

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      preferredCurrencyCode: 'USD',
    },
  });

  // Reset form when user preferences are loaded
  useEffect(() => {
    if (userPref?.preferredCurrencyCode) {
      form.reset({
        preferredCurrencyCode: userPref.preferredCurrencyCode,
      });
    }
  }, [userPref, form]);

  const currencyOptions = currencies?.map(c => ({
    label: `${c.code} - ${c.name} (${c.symbol})`,
    value: c.code,
  })) || [];

  const isLoading = updateUser.isPending || userLoading;

  async function onSubmit(values: PreferencesFormValues) {
    try {
      if (values.preferredCurrencyCode === userPref?.preferredCurrencyCode) {
        toast.info("No changes made to preferences.");
        return;
      }
      
      await updateUser.mutateAsync(values);
      toast.success("Preferences updated successfully!");
    } catch (error) {
      toast.error("Failed to update preferences.");
    }
  }

  if (userLoading || currenciesLoading) {
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
