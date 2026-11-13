import React from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

// A date field that behaves the same in every webview: the whole field is the tap
// target, and an invisible native <input type="date"> fills it so the platform's own
// date picker still opens (with the native input as the fallback everywhere else).
export default function DateField({ value, onChange, className, placeholder = 'Select date', ...props }) {
  const parsed = value ? new Date(`${value}T00:00:00`) : null;
  const display =
    parsed && !Number.isNaN(parsed.getTime())
      ? parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : placeholder;

  return (
    <div className={cn('relative min-h-11 rounded-md border border-input bg-transparent shadow-sm', className)}>
      <div className="flex h-full min-h-11 items-center justify-between gap-2 px-3 text-sm">
        <span className={cn('truncate', !value && 'text-muted-foreground')}>{display}</span>
        <Calendar className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
      </div>
      <input
        type="date"
        value={value || ''}
        onChange={onChange}
        aria-label={props['aria-label'] || placeholder}
        className="absolute inset-0 h-full w-full cursor-pointer rounded-md opacity-0"
        {...props}
      />
    </div>
  );
}