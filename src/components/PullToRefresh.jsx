import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const THRESHOLD = 70;

// Gesture-based pull-to-refresh wrapper. Listens to touch on the window scroll
// surface and reveals a spinner when the user pulls down at the top of the page.
export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  const handleStart = useCallback((e) => {
    if (window.scrollY > 0 || refreshing) return;
    // Horizontal carousels opt out with data-ptr-ignore so a swipe never pulls the page.
    if (e.target instanceof Element && e.target.closest('[data-ptr-ignore]')) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, [refreshing]);

  const handleMove = useCallback((e) => {
    if (!pulling.current || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0 && window.scrollY <= 0) {
      setPull(Math.min(delta * 0.5, 100));
    }
  }, [refreshing]);

  const handleEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pull >= THRESHOLD) {
      setRefreshing(true);
      setPull(THRESHOLD);
      try {
        await onRefresh?.();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  }, [pull, onRefresh, refreshing]);

  useEffect(() => {
    window.addEventListener('touchstart', handleStart, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd);
    return () => {
      window.removeEventListener('touchstart', handleStart);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [handleStart, handleMove, handleEnd]);

  return (
    <div className="relative touch-pan-y">
      <motion.div
        animate={{ height: refreshing ? THRESHOLD : pull }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex items-center justify-center overflow-hidden"
      >
        <Loader2 className={cn('h-6 w-6 text-muted-foreground', refreshing && 'animate-spin')} />
      </motion.div>
      {children}
    </div>
  );
}