import React from 'react';
import { Link } from 'react-router-dom';
import ClientAvatar from './ClientAvatar';
import { firstName } from '@/lib/book';

export default function RecentRow({ clients }) {
  if (clients.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-3">In the chair lately</h2>
      <div data-ptr-ignore className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 touch-pan-x">
        {clients.map((c) => (
          <Link key={c.id} to={`/book/client/${c.id}`} className="flex flex-col items-center gap-2 w-20 shrink-0">
            <ClientAvatar name={c.name} photoUrl={c.lastPhoto} />
            <span className="text-sm font-medium truncate w-full text-center">{firstName(c.name)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}