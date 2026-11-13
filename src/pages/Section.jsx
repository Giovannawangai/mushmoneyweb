import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useExpenses, useCategories } from '@/lib/api';
import { formatCurrency } from '@/lib/money';
import SelectorHeader from '@/components/SelectorHeader';
import { Plus, Tag } from 'lucide-react';

export default function Section() {
  const [params] = useSearchParams();
  const name = params.get('name') || 'Section';
  const catParam = params.get('category') || '';
  const names = catParam.split('|').filter(Boolean);
  const { data: expenses = [] } = useExpenses();
  const { data: categories = [] } = useCategories();
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState('all');

  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
  const sectionCats = useMemo(() => categories.filter((c) => names.includes(c.name)), [categories, names]);
  const filtered = useMemo(
    () => expenses.filter((e) => names.includes(catMap[e.category_id]?.name)),
    [expenses, catMap, names]
  );

  const byCat = useMemo(() => {
    const map = {};
    filtered.forEach((e) => { (map[e.category_id] = map[e.category_id] || []).push(e); });
    return map;
  }, [filtered]);

  return (
    <div className="px-5 pt-6 pb-10 min-h-screen bg-background text-foreground">
      <SelectorHeader
        icon={Tag}
        title={name}
        onBack={() => navigate(-1)}
        pills={sectionCats.map((c) => ({ key: c.id, label: c.name }))}
        selectedKey={selectedCat}
        onSelect={setSelectedCat}
        action={
          <button
            onClick={() => navigate('/add')}
            aria-label="Add expense"
            className="h-11 w-11 rounded-full bg-muted text-foreground flex items-center justify-center"
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">No expenses in this section yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(selectedCat === 'all' ? sectionCats : sectionCats.filter((c) => c.id === selectedCat)).map((cat) => {
            const items = (byCat[cat.id] || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
            if (!items.length) return null;
            const catTotal = items.reduce((s, e) => s + Number(e.amount), 0);
            return (
              <div key={cat.id} className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat.emoji} {cat.name}</h2>
                  <span className="text-xs text-muted-foreground">{formatCurrency(catTotal)}</span>
                </div>
                <div>
                  {items.map((e, i) => (
                    <div key={e.id} className={`px-4 py-3 flex items-center gap-3 ${i > 0 ? 'border-t border-border' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-foreground">{e.note || cat.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <span className="font-semibold text-foreground">{formatCurrency(e.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}