import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CategoryPicker from '@/components/CategoryPicker';
import DateField from '@/components/DateField';
import { useConfirm } from '@/components/ConfirmDialog';
import { patchList } from '@/lib/optimistic';

export default function ExpenseEditDialog({ expense, categories, onClose }) {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [amount, setAmount] = useState(String(expense.amount));
  const [categoryId, setCategoryId] = useState(expense.category_id);
  const [note, setNote] = useState(expense.note || '');
  const [date, setDate] = useState(expense.date);
  const [busy, setBusy] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.update(expense.id, data),
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ['expenses'] });
      const previous = qc.getQueryData(['expenses']);
      qc.setQueryData(['expenses'], (old) =>
        patchList(old, (list) => list.map((e) => (e.id === expense.id ? { ...e, ...data } : e)))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) qc.setQueryData(['expenses'], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Expense.delete(expense.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['expenses'] });
      const previous = qc.getQueryData(['expenses']);
      qc.setQueryData(['expenses'], (old) => patchList(old, (list) => list.filter((e) => e.id !== expense.id)));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) qc.setQueryData(['expenses'], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });

  const save = async () => {
    setBusy(true);
    try {
      await saveMutation.mutateAsync({
        amount: parseFloat(amount) || 0,
        category_id: categoryId,
        note: note.trim(),
        date,
      });
      onClose();
    } catch (e) {
      setBusy(false);
    }
  };

  const del = async () => {
    const ok = await confirm({ title: 'Delete expense', description: 'Delete this expense?', confirmText: 'Delete', destructive: true });
    if (!ok) return;
    setBusy(true);
    try {
      await deleteMutation.mutateAsync();
      onClose();
    } catch (e) {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit expense</DialogTitle>
        </DialogHeader>
        <Input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 text-lg" />
        <CategoryPicker categories={categories} value={categoryId} onChange={setCategoryId} />
        <Input placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} className="h-12" />
        <DateField value={date} onChange={(e) => setDate(e.target.value)} className="h-12" />
        <DialogFooter className="flex gap-2">
          <Button variant="destructive" onClick={del} disabled={busy}>
            Delete
          </Button>
          <Button onClick={save} disabled={busy}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}