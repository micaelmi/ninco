'use client';

import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface IconRendererProps extends LucideProps {
  name: string;
}

export function IconRenderer({ name, ...props }: IconRendererProps) {
  const Icon = (Icons as any)[name];

  if (!Icon) {
    return <Icons.HelpCircle {...props} />;
  }

  return <Icon {...props} />;
}

export const CATEGORY_ICONS = [
  'ShoppingBag',
  'ShoppingCart',
  'Utensils',
  'Coffee',
  'Car',
  'Bus',
  'Plane',
  'Home',
  'Smartphone',
  'Laptop',
  'Tv',
  'Gift',
  'Heart',
  'Stethoscope',
  'GraduationCap',
  'Briefcase',
  'Banknote',
  'CreditCard',
  'PiggyBank',
  'Wallet',
  'Flame',
  'Zap',
  'Droplets',
  'Scissors',
  'Hammer',
  'Music',
  'Film',
  'Gamepad2',
  'Dumbbell',
  'Palmtree',
];

export const CATEGORY_COLORS = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Slate', value: '#64748b' },
  { name: 'Zinc', value: '#71717a' },
];
