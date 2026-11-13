import React from 'react';
import { Trash2, Pencil, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/money';

// A sub-tag that also has a matching recurring bill — rendered with a pay button.
export default function TagBillRow({ category, bill, onEdit, onDelete, onPay }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card border border-border p-3 no-select" style={{ marginLeft: 20 }}>
      <div className="h-10 w-10 rounded-full flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: category.color + '22' }}>
        {category.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate text-sm text-muted-foreground">{category.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(bill.amount)} / {bill.interval === 'year' ? 'year' : 'month'}
          {bill.last_paid ? ` · last charged ${bill.last_paid}` : ''}
        </p>
      </div>
      <button onClick={() => onPay(bill)} className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0" title="Pay">
        <CreditCard className="h-4 w-4" />
      </button>
      <button onClick={() => onEdit(bill)} aria-label={`Edit ${bill.name}`} className="h-11 w-11 rounded-full bg-muted flex items-center justify-center shrink-0">
        <Pencil className="h-4 w-4 text-muted-foreground" />
      </button>
      <button onClick={() => onDelete(bill)} aria-label={`Delete ${bill.name}`} className="h-11 w-11 rounded-full bg-muted flex items-center justify-center shrink-0">
        <Trash2 className="h-4 w-4 text-red-500" />
      </button>
    </div>
  );
}