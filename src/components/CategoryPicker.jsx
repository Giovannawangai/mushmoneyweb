import React from 'react';

export default function CategoryPicker({ categories, value, onChange }) {
  const topLevel = categories.filter((c) => !c.parent_id);
  const childrenOf = (parentId) => categories.filter((c) => c.parent_id === parentId);
  const orphans = categories.filter((c) => c.parent_id && !categories.some((p) => p.id === c.parent_id));

  const Tag = ({ c, sub = false }) => {
    const selected = value === c.id;
    return (
      <button
        key={c.id}
        type="button"
        onClick={() => onChange(c.id)}
        className={`flex flex-col items-center justify-center gap-1 p-2 min-h-11 rounded-2xl border-2 transition ${
          selected ? 'border-primary bg-muted' : 'border-transparent bg-muted'
        }`}
      >
        <span className="text-2xl">{c.emoji}</span>
        <span className="text-sm text-muted-foreground truncate w-full text-center">{c.name}</span>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {topLevel.map((c) => {
        const subs = childrenOf(c.id);
        return (
          <div key={c.id}>
            {subs.length > 0 ? (
              <p className="text-xs text-muted-foreground mb-1.5 px-1">{c.emoji} {c.name}</p>
            ) : null}
            <div className="grid grid-cols-4 gap-3">
              {subs.length === 0 && <Tag c={c} />}
              {subs.map((s) => (
                <Tag key={s.id} c={s} sub />
              ))}
            </div>
          </div>
        );
      })}
      {orphans.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {orphans.map((c) => (
            <Tag key={c.id} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}