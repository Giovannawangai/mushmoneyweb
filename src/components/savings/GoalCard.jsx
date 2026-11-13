import React from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { formatCurrencyExact } from '@/lib/money';

export default function GoalCard({ goal, onAddFunds, onEdit, onDelete }) {
  const saved = goal.saved_amount || 0;
  const target = goal.target_amount || 0;
  const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const done = saved >= target && target > 0;

  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{goal.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrencyExact(saved)} of {formatCurrencyExact(target)}
            {goal.target_date ? ` · by ${goal.target_date}` : ''}
          </p>
        </div>
        <button onClick={onEdit} aria-label={`Edit ${goal.name}`} className="h-11 w-11 rounded-full bg-muted flex items-center justify-center shrink-0">
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </button>
        <button onClick={onDelete} aria-label={`Delete ${goal.name}`} className="h-11 w-11 rounded-full bg-muted flex items-center justify-center shrink-0">
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </div>

      <div className="mt-3 h-2.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground">{pct}% saved</span>
        {done && <span className="text-xs font-medium text-emerald-600">Goal reached 🎉</span>}
      </div>

      <button
        onClick={onAddFunds}
        className="w-full mt-3 min-h-11 rounded-xl border-2 border-border text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-muted transition"
      >
        <Plus className="h-4 w-4" /> Add to savings
      </button>
    </div>
  );
}