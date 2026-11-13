import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ClientAvatar from '@/components/book/ClientAvatar';
import RecentRow from '@/components/book/RecentRow';
import StaleList from '@/components/book/StaleList';
import NewClientDialog from '@/components/book/NewClientDialog';
import { useClients, useVisits, useBookRefresh } from '@/lib/bookApi';
import PullToRefresh from '@/components/PullToRefresh';
import { daysSince, STALE_DAYS } from '@/lib/book';

export default function BookHome() {
  const { data: clients = [], isLoading } = useClients();
  const { data: visits = [] } = useVisits();
  const [query, setQuery] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const refresh = useBookRefresh();

  const enriched = useMemo(() => {
    // One pass over the visits builds a per-client lookup, instead of scanning
    // the whole visit list once for every client.
    const byClient = new Map();
    visits.forEach((v) => {
      const list = byClient.get(v.client_id);
      if (list) list.push(v);
      else byClient.set(v.client_id, [v]);
    });
    return clients.map((c) => {
      const mine = byClient.get(c.id) || [];
      const last = mine[0];
      return {
        ...c,
        lastVisitDate: last?.date || c.last_visit || null,
        lastPhoto: mine.find((v) => v.photo_url)?.photo_url || null,
      };
    });
  }, [clients, visits]);

  const recent = useMemo(
    () =>
      enriched
        .filter((c) => c.lastVisitDate)
        .sort((a, b) => (a.lastVisitDate < b.lastVisitDate ? 1 : -1))
        .slice(0, 8),
    [enriched]
  );

  const stale = useMemo(
    () =>
      enriched
        .map((c) => ({ ...c, days: daysSince(c.lastVisitDate) }))
        .filter((c) => c.days !== null && c.days > STALE_DAYS)
        .sort((a, b) => b.days - a.days),
    [enriched]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return enriched.filter((c) => c.name.toLowerCase().includes(q) || (c.phone || '').includes(q)).slice(0, 20);
  }, [enriched, query]);

  return (
    <PullToRefresh onRefresh={refresh}>
    <div className="px-5 pt-5">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a client"
          className="h-14 pl-12 text-lg bg-card"
        />
      </div>

      {query.trim() ? (
        <div className="rounded-lg border border-border bg-card divide-y divide-border overflow-hidden mb-6">
          {results.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No client by that name.</p>
          ) : (
            results.map((c) => (
              <Link key={c.id} to={`/book/client/${c.id}`} className="flex items-center gap-3 p-3 active:bg-muted">
                <ClientAvatar name={c.name} photoUrl={c.lastPhoto} size="sm" />
                <div className="min-w-0">
                  <p className="font-semibold truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.phone}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      ) : (
        <>
          <RecentRow clients={recent} />
          <StaleList clients={stale} />
          {isLoading && <p className="text-sm text-muted-foreground">Loading clients…</p>}
          <section className="mb-6">
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-3">
              All clients · {clients.length}
            </h2>
            <div className="rounded-lg border border-border bg-card divide-y divide-border overflow-hidden">
              {enriched.map((c) => (
                <Link key={c.id} to={`/book/client/${c.id}`} className="flex items-center gap-3 p-3 active:bg-muted">
                  <ClientAvatar name={c.name} photoUrl={c.lastPhoto} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.style || c.phone}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      <Button onClick={() => setNewOpen(true)} variant="outline" className="w-full h-14 text-base gap-2">
        <UserPlus className="h-5 w-5" /> New client
      </Button>

      <NewClientDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
    </PullToRefresh>
  );
}