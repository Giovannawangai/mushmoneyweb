import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatCurrencyExact } from '@/lib/money';
import { patchList } from '@/lib/optimistic';

export default function AddFundsDialog({ goal, onClose, onSaved }) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const remaining = Math.max(0, (goal?.target_amount || 0) - (goal?.saved_amount || 0));

  const addMutation = useMutation({
    mutationFn: (nextAmount) => base44.entities.Goal.update(goal.id, { saved_amount: nextAmount }),
    onMutate: async (nextAmount) => {
      await qc.cancelQueries({ queryKey: ['goals'] });
      const previous = qc.getQueryData(['goals']);
      qc.setQueryData(['goals'], (old) =>
        patchList(old, (list) => list.map((g) => (g.id === goal.id ? { ...g, saved_amount: nextAmount } : g)))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) qc.setQueryData(['goals'], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  });

  const save = async () => {
    const v = parseFloat(amount);
    if (!(v > 0)) return;
    setSaving(true);
    try {
      await addMutation.mutateAsync(Math.max(0, (goal.saved_amount || 0) + v));
      onSaved();
    } catch (e) {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to {goal?.name}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Set aside {formatCurrencyExact(goal?.saved_amount || 0)} so far · {formatCurrencyExact(remaining)} to go
        </p>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="Amount to add"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-12"
          autoFocus
        />
        <DialogFooter>
          <Button onClick={save} disabled={saving} className="w-full">
            {saving ? 'Saving…' : 'Add to savings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}