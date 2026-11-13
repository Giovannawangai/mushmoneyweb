import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CategoryPicker from '@/components/CategoryPicker';
import DateField from '@/components/DateField';
import { useCategories, useRefresh } from '@/lib/api';
import { formatCurrencyExact } from '@/lib/money';

export default function AddExpense() {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const refresh = useRefresh(['expenses']);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const parsedAmount = parseFloat(amount) || 0;

  const save = async () => {
    if (!categoryId) { setError('Pick a category'); return; }
    if (parsedAmount <= 0) { setError('Enter an amount'); return; }
    setError('');
    setSaving(true);
    try {
      await base44.entities.Expense.create({ amount: parsedAmount, category_id: categoryId, note: note.trim(), date });
      refresh();
      navigate('/');
    } catch (e) {
      setError('Could not save. Try again.');
      setSaving(false);
    }
  };

  return (
    <div className="px-5 pt-6 min-h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground">Cancel</button>
        <h1 className="text-lg font-semibold">Add expense</h1>
        <div className="w-12" />
      </div>

      <div className="text-center mb-6">
        <div className="text-6xl font-bold tracking-tight">
          {parsedAmount > 0 ? formatCurrencyExact(parsedAmount) : <span className="text-muted-foreground opacity-40">$0.00</span>}
        </div>
      </div>

      <Input
        type="number"
        inputMode="decimal"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="text-center text-2xl h-14 mb-5"
        autoFocus
      />

      <div className="mb-5">
        <p className="text-sm text-muted-foreground mb-2">Category</p>
        <CategoryPicker categories={categories} value={categoryId} onChange={setCategoryId} />
      </div>

      <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="h-12 mb-3" />
      <DateField value={date} onChange={(e) => setDate(e.target.value)} className="h-12 mb-2" />

      {error && <p className="text-sm text-red-500 mb-2 text-center">{error}</p>}

      <Button onClick={save} disabled={saving} className="h-14 text-base w-full mt-2" size="lg">
        {saving ? 'Saving…' : 'Save expense'}
      </Button>
    </div>
  );
}