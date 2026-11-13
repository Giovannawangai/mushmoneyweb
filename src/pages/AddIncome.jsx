import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRefresh } from '@/lib/api';
import DateField from '@/components/DateField';
import { formatCurrencyExact } from '@/lib/money';

const SOURCES = ['Salary', 'Freelance', 'Gift', 'Refund', 'Other'];

export default function AddIncome() {
  const navigate = useNavigate();
  const refresh = useRefresh(['incomes']);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Salary');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const parsedAmount = parseFloat(amount) || 0;

  const save = async () => {
    if (parsedAmount <= 0) {
      setError('Enter an amount');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await base44.entities.Income.create({ amount: parsedAmount, source, note: note.trim(), date });
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
        <h1 className="text-lg font-semibold">Add income</h1>
        <div className="w-12" />
      </div>

      <div className="text-center mb-6">
        <div className="text-6xl font-bold tracking-tight text-emerald-600">
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
        <p className="text-sm text-muted-foreground mb-2">Source</p>
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSource(s)}
              className={`px-4 h-11 rounded-full text-sm border-2 transition ${source === s ? 'border-primary bg-muted' : 'border-transparent bg-muted'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="h-12 mb-3" />
      <DateField value={date} onChange={(e) => setDate(e.target.value)} className="h-12 mb-2" />

      {error && <p className="text-sm text-red-500 mb-2 text-center">{error}</p>}

      <Button onClick={save} disabled={saving} className="h-14 text-base w-full mt-2" size="lg">
        {saving ? 'Saving…' : 'Save income'}
      </Button>
    </div>
  );
}