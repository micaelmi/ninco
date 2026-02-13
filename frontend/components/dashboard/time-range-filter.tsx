'use client';

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export type TimeRange = 'week' | 'month' | 'year' | 'custom';

interface TimeRangeFilterProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  label: string;
  customRange?: { from: Date; to: Date };
  onCustomRangeChange?: (range: { from: Date; to: Date }) => void;
}

export function TimeRangeFilter({ 
  value, 
  onChange, 
  onNavigate, 
  label,
  customRange,
  onCustomRangeChange
}: TimeRangeFilterProps) {
  return (
    <div className="flex flex-wrap md:justify-end items-center gap-2 w-min">
      {/* Navigation and Label */}
      <div className="flex justify-center items-center gap-2 bg-muted/50 p-1 border rounded-lg w-full md:w-fit h-10">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-background/80 w-8 h-8 transition-all"
          onClick={() => onNavigate('prev')}
          disabled={value === 'custom'}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="min-w-[120px] font-mono text-zinc-600 text-xs text-center uppercase tracking-wider">
          {label}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-background/80 w-8 h-8 transition-all"
          onClick={() => onNavigate('next')}
          disabled={value === 'custom'}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Range Presets */}
      <div className="flex items-center gap-1 bg-muted p-1 border rounded-lg h-10">
        {['week', 'month', 'year'].map((range) => (
          <Button
            key={range}
            variant="ghost"
            size="sm"
            className={cn(
              "px-3 h-8 font-mono text-xs capitalize transition-all",
              value === range ? "bg-emerald-500 text-emerald-50 shadow-sm" : "hover:bg-background/50"
            )}
            onClick={() => onChange(range as TimeRange)}
          >
            {range}
          </Button>
        ))}
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-3 h-8 font-mono text-xs transition-all",
                value === 'custom' ? "bg-emerald-500 text-emerald-50 shadow-sm" : "hover:bg-background/50"
              )}
              onClick={() => onChange('custom')}
            >
              <CalendarIcon className="mr-2 w-3 h-3" />
              Custom
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={customRange?.from || new Date()}
              selected={customRange}
              onSelect={(range: any) => {
                if (range?.from && range?.to) {
                  onCustomRangeChange?.({ from: range.from, to: range.to });
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
