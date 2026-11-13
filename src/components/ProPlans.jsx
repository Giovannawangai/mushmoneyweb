import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useErrorToast } from '@/components/ErrorToast';

const PLANS = [
  { id: 'monthly', name: 'Monthly', price: '$4.99', per: 'per month', note: 'Cancel anytime' },
  { id: 'yearly', name: 'Yearly', price: '$39.99', per: 'per year', note: 'Save 33% — 2 months free', badge: 'Best value' },
];

export default function ProPlans() {
  const [plan, setPlan] = useState('yearly');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const showError = useErrorToast();

  const checkout = async () => {
    if (window.self !== window.top) {
      showError('Checkout only works from the published app. Open the app in a new tab to upgrade.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const res = await base44.functions.invoke('createCheckout', { plan });
      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }
      setError('Could not start checkout. Try again.');
    } catch (e) {
      setError('Could not start checkout. Try again.');
    }
    setBusy(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm mb-3">Unlock premium budgeting features.</p>

      <div className="space-y-2 mb-4">
        {PLANS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPlan(p.id)}
            className={`w-full flex items-center gap-3 rounded-xl border-2 p-3 text-left transition ${plan === p.id ? 'border-primary' : 'border-border'}`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{p.name}</p>
                {p.badge && <span className="text-[10px] rounded-full bg-primary text-primary-foreground px-2 py-0.5">{p.badge}</span>}
              </div>
              <p className="text-xs text-muted-foreground">{p.note}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{p.price}</p>
              <p className="text-[10px] text-muted-foreground">{p.per}</p>
            </div>
            {plan === p.id && <Check className="h-5 w-5 text-primary shrink-0" />}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

      <Button onClick={checkout} disabled={busy} className="w-full h-12">
        {busy ? 'Opening checkout…' : `Upgrade ${plan === 'yearly' ? 'yearly' : 'monthly'}`}
      </Button>
    </div>
  );
}