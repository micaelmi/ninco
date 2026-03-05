import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import { motion } from 'motion/react';
import { hoverScale } from '@/components/ui/motion';
import { text } from 'stream/consumers';

interface SummaryCardProps {
  title: string;
  value: number | undefined;
  icon: LucideIcon;
  isLoading?: boolean;
  /** Currency code to target */
  currencyCode?: string;
  /** Visual variant */
  variant?: 'default' | 'income' | 'expense' | 'balance';
  /** Optional prefix like '+' or '-' */
  prefix?: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Additional className for the card */
  className?: string;
  /** Custom right-side content (e.g., a button) */
  action?: React.ReactNode;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("bg-muted rounded-md animate-pulse", className)} />;
}

const variantStyles = {
  default: {
    border: 'border-2 border-primary/10',
    text: '',
    icon: '',
  },
  income: {
    border: 'border-l-4 border-l-primary',
    text: 'text-primary',
    icon: 'text-primary',
  },
  expense: {
    border: 'border-l-4 border-l-destructive',
    text: 'text-destructive',
    icon: 'text-destructive',
  },
  balance: {
    border: 'border-l-4 border-l-blue-500',
    text: '',
    icon: 'text-blue-500',
  },
};

export function SummaryCard({
  title,
  value,
  icon: Icon,
  isLoading = false,
  variant = 'default',
  currencyCode,
  prefix = '',
  subtitle,
  className,
  action,
}: SummaryCardProps) {
  const styles = variantStyles[variant];
  const displayValue = value !== undefined ? `${prefix}${formatCurrency(value, currencyCode)}` : `${prefix}${formatCurrency(0, currencyCode)}`;

  // Dynamic text color for balance variant
  const valueColor = variant === 'balance' && value !== undefined
    ? (value >= 0 ? 'text-green-600' : 'text-red-600')
    : styles.text;
  
  const MotionCard = motion.create(Card);

  return (
    <MotionCard 
      className={cn('shadow-sm transition-colors', styles.border, className)}
      whileHover={hoverScale}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        <Icon className={cn('w-4 h-4', styles.icon)} />
      </CardHeader>
      <CardContent className={action ? 'flex flex-row justify-between items-end space-y-0 pb-2' : ''}>
        <div>
          <div className={cn('font-mono font-bold text-2xl', valueColor)}>
            {isLoading ? <Skeleton className="w-20 h-8" /> : displayValue}
          </div>
          {subtitle && (
            <p className="mt-1 text-muted-foreground text-xs">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </CardContent>
    </MotionCard>
  );
}
