import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrencyExact } from '@/lib/money';
import { useErrorToast } from '@/components/ErrorToast';

const MODES = [
  { id: 'payment', label: 'One-time', icon: CreditCard },
  { id: 'subscription', label: 'Monthly', icon: RefreshCw },
];

export default function Pay() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState('payment');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const showError = useErrorToast();

  const parsedAmount = parseFloat(amount) || 0;

  const pay = async () => {
    if (parsedAmount <= 0) {
      setError('Enter an amount');
      return;
    }
    if (window.self !== window.top) {
      showError('Checkout only works from the published app. Open the app in a new tab to pay.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const res = await base44.functions.invoke('createCheckout', {
        amount: parsedAmount,
        name: name.trim() || 'Payment',
        mode,
        interval: 'month',
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }
      setError(res.data?.error || 'Could not start checkout. Try again.');
    } catch (e) {
      setError('Could not start checkout. Try again.');
    }
    setBusy(false);
  };

  return (
    <div className="px-5 pt-6 min-h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground">Cancel</button>
        <h1 className="text-lg font-semibold">Take card payment</h1>
        <div className="w-12" />
      </div>

      <div className="text-center mb-6">
        <div className="text-6xl font-bold tracking-tight text-primary">
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

      <Input
        placeholder="What is this for? (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-12 mb-5"
      />

      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-2">Charge type</p>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map((m) => {
            const active = mode === m.id;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 text-sm transition ${active ? 'border-primary bg-muted' : 'border-border'}`}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mb-2 text-center">{error}</p>}

      <Button onClick={pay} disabled={busy} className="h-14 text-base w-full mt-auto" size="lg">
        {busy ? 'Opening checkout…' : `Charge ${parsedAmount > 0 ? formatCurrencyExact(parsedAmount) : ''}`}
      </Button>
      <p className="text-xs text-muted-foreground text-center mt-3">Secure card payment via Stripe</p>
    </div>
  );
}