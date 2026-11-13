import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SHOP_NAME, SHOP_TAGLINE } from '@/lib/book';
import { motion, AnimatePresence } from 'framer-motion';
import useTabNavigation from '@/lib/useTabNavigation';

const items = [
  { to: '/book', label: 'Clients', icon: Users },
  { to: '/book/dashboard', label: 'Shop', icon: BarChart3 },
];

const TAB_ROOTS = items.map((item) => item.to);

export default function BookLayout() {
  const { pathname } = useLocation();
  const isActive = (to) => (to === '/book' ? pathname === '/book' || pathname.startsWith('/book/client') : pathname === to);
  const { onTabClick } = useTabNavigation(TAB_ROOTS, '/book');

  return (
    <div data-theme="clientbook" className="min-h-screen bg-background text-foreground font-body">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-primary text-primary-foreground border-r-4 border-brand flex-col z-40">
        <div className="px-5 py-6 text-center border-b border-white/10">
          <h1 className="font-display text-3xl tracking-[0.18em] leading-none">{SHOP_NAME}</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-70 mt-1">{SHOP_TAGLINE}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={onTabClick(to)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
                  active ? 'bg-brand text-brand-foreground font-semibold' : 'text-primary-foreground/80 hover:bg-white/10'
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 bg-primary text-primary-foreground border-b-4 border-brand" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-2xl mx-auto px-5 py-3 text-center">
          <h1 className="font-display text-3xl tracking-[0.18em] leading-none">{SHOP_NAME}</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-70 mt-1">{SHOP_TAGLINE}</p>
        </div>
      </header>

      <div className="lg:pl-64">
        <main className="max-w-2xl mx-auto pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-2xl mx-auto flex h-16">
          {items.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={onTabClick(to)} className="flex-1 flex flex-col items-center justify-center gap-1">
              <Icon className={cn('h-5 w-5', isActive(to) ? 'text-brand' : 'text-muted-foreground')} strokeWidth={isActive(to) ? 2.5 : 2} />
              <span className={cn('text-xs uppercase tracking-wider', isActive(to) ? 'text-brand font-semibold' : 'text-muted-foreground')}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}