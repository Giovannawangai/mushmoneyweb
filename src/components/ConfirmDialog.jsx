import React, { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Native-looking replacement for window.confirm(). One dialog is mounted in App and
// any component can await the answer: const ok = await confirmAction({ ... }).
let pending = null;
let current = null;
const listeners = new Set();

const publish = (options) => {
  current = options;
  listeners.forEach((listener) => listener(options));
};

export function confirmAction(options = {}) {
  if (pending) {
    const previous = pending;
    pending = null;
    previous(false);
  }
  publish({
    title: options.title || 'Are you sure?',
    description: options.description || '',
    confirmText: options.confirmText || 'Confirm',
    cancelText: options.cancelText || 'Cancel',
    destructive: !!options.destructive,
  });
  return new Promise((resolve) => {
    pending = resolve;
  });
}

export function useConfirm() {
  return confirmAction;
}

export function getConfirmOptions() {
  return current;
}

export default function ConfirmDialog() {
  const [options, setOptions] = useState(null);

  useEffect(() => {
    listeners.add(setOptions);
    return () => {
      listeners.delete(setOptions);
    };
  }, []);

  const close = (result) => {
    const resolve = pending;
    pending = null;
    setOptions(null);
    if (resolve) resolve(result);
  };

  return (
    <AlertDialog open={!!options} onOpenChange={(open) => { if (!open) close(false); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options?.title}</AlertDialogTitle>
          {options?.description ? (
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => close(false)} className="min-h-11">
            {options?.cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => close(true)}
            className={
              options?.destructive
                ? 'min-h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'min-h-11'
            }
          >
            {options?.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}