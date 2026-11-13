import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// A select-style trigger that opens a native-feeling bottom sheet (vaul drawer)
// instead of a dropdown popover — better for mobile webviews.
export default function BottomSheetSelect({ value, onChange, placeholder, options, triggerClassName }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex min-h-11 h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
          triggerClassName
        )}
      >
        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[70vh]">
          <DrawerHeader>
            <DrawerTitle>{placeholder || 'Select'}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-2 pb-[env(safe-area-inset-bottom)] pb-6">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  'w-full min-h-11 flex items-center justify-between rounded-lg px-3 py-3 text-left text-sm no-select',
                  o.value === value ? 'bg-muted font-medium' : 'hover:bg-muted/50'
                )}
              >
                <span>{o.label}</span>
                {o.value === value && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}