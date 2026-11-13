import React, { useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Home, History, Tag, CreditCard, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/lib/api';
import { setCurrency } from '@/lib/money';
import useTabNavigation from '@/lib/useTabNavigation';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/history', label: 'History', icon: History },
  { to: '/categories', label: 'Tags', icon: Tag },
  { to: '/pay', label: 'Pay', icon: CreditCard },
  { to: '/savings', label: 'Savings', icon: PiggyBank },
];

const TAB_ROOTS = navItems.map((item) => item.to);

export default function Layout() {
  const location = useLocation();
  const isActive = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));
  const { data: settings } = useSettings();
  const { onTabClick } = useTabNavigation(TAB_ROOTS, '/');

  useEffect(() => {
    if (settings?.currency) setCurrency(settings.currency);
  }, [settings?.currency]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 border-r border-border bg-card flex-col z-40">
        <div className="px-5 py-6 border-b border-border">
          <p className="text-sm text-muted-foreground">Mushmoney</p>
          <h1 className="text-lg font-semibold">{settings?.display_name || 'Budget Tracker'}</h1>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onTabClick(item.to)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
                  active ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <main className="mx-auto max-w-2xl pt-[env(safe-area-inset-top)] pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
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
      <nav className="lg:hidden fixed bottom-0 inset-x-0 max-w-md mx-auto bg-card border-t border-border z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => (
            <NavBtn key={item.to} {...item} active={isActive(item.to)} onClick={onTabClick(item.to)} />
          ))}
        </div>
      </nav>
    </div>
  );
}

function NavBtn({ to, label, icon: Icon, active, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="flex flex-col items-center justify-center gap-1 flex-1 h-full">
      <Icon className={cn('h-5 w-5', active ? 'text-primary' : 'text-muted-foreground')} strokeWidth={active ? 2.5 : 2} />
      <span className={cn('text-[10px]', active ? 'text-primary font-medium' : 'text-muted-foreground')}>{label}</span>
    </Link>
  );
}