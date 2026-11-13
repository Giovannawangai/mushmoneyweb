import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import DateField from '@/components/DateField';
import { patchList } from '@/lib/optimistic';

export default function GoalDialog({ goal, onClose, onSaved }) {
  const isEdit = !!goal;
  const qc = useQueryClient();
  const [name, setName] = useState(goal?.name || '');
  const [target, setTarget] = useState(goal?.target_amount ? String(goal.target_amount) : '');
  const [date, setDate] = useState(goal?.target_date || '');
  const [note, setNote] = useState(goal?.note || '');
  const [saving, setSaving] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? base44.entities.Goal.update(goal.id, payload) : base44.entities.Goal.create(payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ['goals'] });
      const previous = qc.getQueryData(['goals']);
      qc.setQueryData(['goals'], (old) =>
        patchList(old, (list) =>
          isEdit
            ? list.map((g) => (g.id === goal.id ? { ...g, ...payload } : g))
            : [{ id: `temp-${Date.now()}`, ...payload }, ...list]
        )
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) qc.setQueryData(['goals'], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  });

  const save = async () => {
    if (!name.trim() || !(parseFloat(target) > 0)) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      target_amount: parseFloat(target),
      target_date: date || null,
      note: note.trim(),
    };
    try {
      await saveMutation.mutateAsync(isEdit ? payload : { ...payload, saved_amount: 0 });
      onSaved();
    } catch (e) {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit goal' : 'New savings goal'}</DialogTitle>
        </DialogHeader>

        <Input placeholder="What are you saving for? (e.g. New laptop)" value={name} onChange={(e) => setName(e.target.value)} className="h-12" autoFocus />
        <Input type="number" inputMode="decimal" placeholder="Target amount" value={target} onChange={(e) => setTarget(e.target.value)} className="h-12" />
        <DateField value={date} placeholder="Target date (optional)" onChange={(e) => setDate(e.target.value)} className="h-12" />
        <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="h-12" />

        <DialogFooter>
          <Button onClick={save} disabled={saving} className="w-full">
            {saving ? 'Saving…' : 'Save goal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}