'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, Check, Search } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCreateCategory } from '@/lib/hooks/use-categories';
import { categoryFormSchema, type CategoryFormValues } from '@/lib/validations/category';
import { IconRenderer, CATEGORY_ICONS, CATEGORY_COLORS } from '@/components/ui/icon-renderer';
import { cn } from '@/lib/utils';

interface CategoryFormProps {
  type: 'INCOME' | 'EXPENSE';
  onSuccess: (categoryId: string) => void;
  onCancel: () => void;
}

export function CategoryForm({ type, onSuccess, onCancel }: CategoryFormProps) {
  const [iconSearch, setIconSearch] = useState('');
  const createCategory = useCreateCategory();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      type,
      color: CATEGORY_COLORS[0].value,
      icon: CATEGORY_ICONS[0],
    },
  });

  const filteredIcons = CATEGORY_ICONS.filter((icon) =>
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  async function onSubmit(values: CategoryFormValues) {
    try {
      const category = await createCategory.mutateAsync({
        name: values.name,
        type: values.type,
        color: values.color,
        icon: values.icon,
      });
      onSuccess(category.id);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Groceries, Salary..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Color</FormLabel>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                className={cn(
                  "flex justify-center items-center border-2 rounded-full w-8 h-8 transition-all",
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

        <div className="space-y-4">
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
                  "flex justify-center items-center p-2 border rounded-md transition-all",
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
            disabled={createCategory.isPending}
            className="flex-1"
          >
            {createCategory.isPending ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Category'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
