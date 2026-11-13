import React from 'react';
import { Image } from '@/components/ui/image';
import { Camera } from 'lucide-react';
import { prettyDate } from '@/lib/book';

export default function PhotoGallery({ visits }) {
  const withPhotos = visits.filter((v) => v.photo_url);
  if (withPhotos.length === 0) {
    return (
      <div className="h-48 rounded-lg bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Camera className="h-6 w-6" />
        <p className="text-sm">No photos of the work yet</p>
      </div>
    );
  }
  return (
    <div data-ptr-ignore className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x touch-pan-x">
      {withPhotos.map((v) => (
        <figure key={v.id} className="w-64 shrink-0 snap-start">
          <Image src={v.photo_url} alt={v.service} className="h-64 w-64 rounded-lg object-cover ring-1 ring-border" />
          <figcaption className="mt-1.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{v.service}</span> · {prettyDate(v.date)}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}