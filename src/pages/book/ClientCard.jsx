import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Phone, Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FormulaBox from '@/components/book/FormulaBox';
import PhotoGallery from '@/components/book/PhotoGallery';
import NotesSection from '@/components/book/NotesSection';
import VisitHistory from '@/components/book/VisitHistory';
import FormulaEditDialog from '@/components/book/FormulaEditDialog';
import { useClient, useVisits, useBookRefresh } from '@/lib/bookApi';
import PullToRefresh from '@/components/PullToRefresh';
import { daysSince } from '@/lib/book';

export default function ClientCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id);
  const { data: visits = [] } = useVisits();
  const [editOpen, setEditOpen] = useState(false);
  const refresh = useBookRefresh();

  const mine = useMemo(() => visits.filter((v) => v.client_id === id), [visits, id]);
  const days = daysSince(mine[0]?.date);

  if (isLoading) return <p className="p-5 text-muted-foreground">Loading…</p>;
  if (!client) return <p className="p-5 text-muted-foreground">Client not found.</p>;

  return (
    <PullToRefresh onRefresh={refresh}>
    <div className="pt-4 pb-8">
      <div className="px-5 flex items-start gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="h-11 w-11 rounded-full bg-muted flex items-center justify-center shrink-0">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-tight truncate">{client.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <a href={`tel:${client.phone}`} className="flex items-center gap-1 text-brand font-medium">
              <Phone className="h-3.5 w-3.5" /> {client.phone}
            </a>
            {days !== null && <span>Last in {days}d ago</span>}
          </div>
        </div>
        <button onClick={() => setEditOpen(true)} className="h-11 w-11 rounded-full bg-muted flex items-center justify-center shrink-0">
          <Pencil className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 mb-6">
        <PhotoGallery visits={mine} />
      </div>

      <div className="px-5 space-y-5">
        <FormulaBox client={client} />
        <NotesSection client={client} />
        <VisitHistory visits={mine} />
      </div>

      <div className="px-5 mt-6">
        <Button asChild className="w-full h-16 text-lg gap-2 bg-brand text-brand-foreground hover:bg-brand/90 shadow-lg">
          <Link to={`/book/add-visit?client=${client.id}`}>
            <Plus className="h-6 w-6" strokeWidth={2.5} /> Add Visit
          </Link>
        </Button>
      </div>

      <FormulaEditDialog open={editOpen} onOpenChange={setEditOpen} client={client} />
    </div>
    </PullToRefresh>
  );
}